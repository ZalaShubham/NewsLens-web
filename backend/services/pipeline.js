import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllFeeds } from './feeds.js';
import { clusterArticles } from './cluster.js';
import { analyzeCorpus } from './analyze.js';
import { SOURCES, BUCKETS } from './sources.js';
import { Story } from '../models/Story.js';
import { Source } from '../models/Source.js';
import { Meta } from '../models/Meta.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const CACHE_FILE = path.join(DATA_DIR, 'stories.json');

// In-memory runtime state
export const state = {
  data: null,
  refreshing: false,
  error: null,
  last_run: 0
};

export function loadLocalCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      state.data = parsed;
      state.last_run = fs.statSync(CACHE_FILE).mtimeMs;
      console.log(`[Pipeline] Loaded ${parsed.stories?.length || 0} stories from local cache.`);
      return parsed;
    }
  } catch (err) {
    console.error('[Pipeline] Cache load warning:', err.message);
  }
  return null;
}

export async function runPipeline(log = console.log) {
  if (state.refreshing) {
    log('[Pipeline] Refresh already in progress, skipping...');
    return state.data;
  }

  state.refreshing = true;
  const started = Date.now();

  try {
    log('[Pipeline] 1/3: Fetching RSS feeds...');
    const { articles, report } = await fetchAllFeeds(log);

    if (articles.length === 0) {
      throw new Error('No articles fetched from RSS feeds');
    }

    log(`[Pipeline] 2/3: Clustering ${articles.length} articles using TF-IDF & Agglomerative merging...`);
    const clusters = clusterArticles(articles);

    log(`[Pipeline] 3/3: Analyzing coverage, bias distributions & blindspots...`);
    const { stories, meta } = analyzeCorpus(articles, clusters, report, 2);

    const seconds = Math.round((Date.now() - started) / 100) / 10;
    meta.seconds = seconds;

    const payload = {
      meta,
      stories,
      sources: SOURCES,
      report,
      buckets: BUCKETS
    };

    // Save to local cache file for instant recovery
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[Pipeline] Could not write cache file:', e.message);
    }

    // Save to MongoDB if connected
    try {
      if (Story.db.readyState === 1) {
        log('[Pipeline] Syncing to MongoDB...');
        // Bulk upsert stories
        await Story.deleteMany({});
        if (stories.length > 0) {
          await Story.insertMany(stories);
        }

        // Save sources report
        const counts = Object.fromEntries(report.map(r => [r.source_id, r]));
        await Source.deleteMany({});
        const sourceDocs = SOURCES.map(s => ({
          ...s,
          article_count: counts[s.id]?.count || 0,
          feeds_ok: counts[s.id]?.feeds_ok || 0,
          feeds: counts[s.id]?.feeds || s.urls.length,
          error: counts[s.id]?.error || null
        }));
        await Source.insertMany(sourceDocs);

        // Save Meta
        await Meta.findOneAndUpdate({ key: 'global_meta' }, { key: 'global_meta', ...meta }, { upsert: true });
        log('[Pipeline] MongoDB sync complete.');
      }
    } catch (dbErr) {
      console.warn('[Pipeline] MongoDB sync warning (running in memory mode):', dbErr.message);
    }

    state.data = payload;
    state.error = null;
    state.last_run = Date.now();

    log(`[Pipeline] Done in ${seconds}s: ${meta.story_count} stories (${meta.blindspots.right} right blindspots, ${meta.blindspots.left} left blindspots).`);
    return payload;
  } catch (err) {
    state.error = err.message;
    log(`[Pipeline] Error: ${err.message}`);
    throw err;
  } finally {
    state.refreshing = false;
  }
}
