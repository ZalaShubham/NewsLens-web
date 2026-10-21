import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { SOURCES, BUCKETS } from './services/sources.js';
import { state, runPipeline, loadLocalCache } from './services/pipeline.js';
import { Story } from './models/Story.js';
import { Source } from './models/Source.js';
import { Meta } from './models/Meta.js';
import authRouter from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/groundish_news';

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);

// Helper: slim story for list view
function slimStory(s) {
  const { articles, ...rest } = s;
  return rest;
}

// Helper: Filter & Sort Stories
function filterStories(stories, query) {
  const q = (query.q || '').trim().toLowerCase();
  const blindspot = query.blindspot || '';
  const minOutlets = parseInt(query.min_outlets || '2', 10);
  const owner = query.owner || '';
  const country = query.country || '';
  const sort = query.sort || 'rank';

  let out = stories.filter(story => {
    if (story.outlet_count < minOutlets) return false;
    if (blindspot === 'left' || blindspot === 'right') {
      if (story.blindspot !== blindspot) return false;
    } else if (blindspot === 'any') {
      if (!story.blindspot) return false;
    }
    if (owner && !story.owners?.some(([name]) => name === owner)) return false;
    if (country && !story.countries?.includes(country)) return false;
    if (q) {
      const hay = (story.title + ' ' + (story.summary || '') + ' ' +
        (story.articles?.map(a => a.source + ' ' + a.title).join(' ') || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Sort
  if (sort === 'outlets') {
    out.sort((a, b) => b.outlet_count - a.outlet_count);
  } else if (sort === 'newest') {
    out.sort((a, b) => new Date(b.last_published || 0) - new Date(a.last_published || 0));
  } else if (sort === 'left') {
    out.sort((a, b) => a.skew - b.skew); // Most left-covered first
  } else if (sort === 'right') {
    out.sort((a, b) => b.skew - a.skew); // Most right-covered first
  } else {
    out.sort((a, b) => b.rank - a.rank); // Default: top rank
  }

  return out;
}

// ---------------------------------------------------- Routes

// 1. Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    refreshing: state.refreshing,
    error: state.error,
    has_data: Boolean(state.data),
    last_run: state.last_run,
    meta: state.data?.meta || null
  });
});

// 2. Stories endpoint (with search, filters, pagination)
app.get('/api/stories', async (req, res) => {
  const allStories = state.data?.stories || [];
  if (allStories.length === 0) {
    if (state.refreshing) {
      return res.status(503).json({ error: 'Pipeline is fetching the initial batch of news feeds...' });
    }
  }

  const limit = parseInt(req.query.limit || '60', 10);
  const offset = parseInt(req.query.offset || '0', 10);

  const matched = filterStories(allStories, req.query);
  const paged = matched.slice(offset, offset + limit).map(slimStory);

  res.json({
    meta: state.data?.meta || {},
    total: matched.length,
    stories: paged
  });
});

// 3. Single story details
app.get('/api/story/:id', (req, res) => {
  const story = state.data?.stories?.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  res.json(story);
});

// 4. Sources list with stats & buckets
app.get('/api/sources', (req, res) => {
  const reportMap = Object.fromEntries((state.data?.report || []).map(r => [r.source_id, r]));
  const sourcesWithStats = (state.data?.sources || SOURCES).map(s => ({
    ...s,
    article_count: reportMap[s.id]?.count || 0,
    feeds_ok: reportMap[s.id]?.feeds_ok || 0,
    feeds: reportMap[s.id]?.feeds || s.urls.length,
    error: reportMap[s.id]?.error || null
  }));

  res.json({
    sources: sourcesWithStats,
    buckets: BUCKETS,
    meta: state.data?.meta || null
  });
});

// 5. Meta info
app.get('/api/meta', (req, res) => {
  res.json(state.data?.meta || {});
});

// 6. Manual trigger refresh
app.post('/api/refresh', (req, res) => {
  if (state.refreshing) {
    return res.status(202).json({ status: 'already_refreshing' });
  }
  runPipeline(console.log).catch(err => console.error('[Refresh Error]', err.message));
  res.status(202).json({ status: 'refreshing' });
});

// 7. AI Summary on demand (Stub / Extensible with Gemini / Claude / OpenAI)
app.post('/api/summarize', async (req, res) => {
  const { id } = req.body;
  const story = state.data?.stories?.find(s => s.id === id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  // Generate multi-perspective synthesis
  const leftHeadlines = story.articles.filter(a => a.lean < 0).map(a => `[${a.source}] ${a.title}`).slice(0, 3);
  const rightHeadlines = story.articles.filter(a => a.lean > 0).map(a => `[${a.source}] ${a.title}`).slice(0, 3);
  const centerHeadlines = story.articles.filter(a => a.lean === 0).map(a => `[${a.source}] ${a.title}`).slice(0, 2);

  const synthesizedSummary = story.summary ||
    `Reporting on this event is covered by ${story.outlet_count} outlets across the political spectrum. ` +
    (story.blindspot ? `Notably, this story is a ${story.blindspot.toUpperCase()} BLINDSPOT with minimal coverage from ${story.blindspot} media.` : '');

  res.json({
    id: story.id,
    text: synthesizedSummary,
    model: 'groundish-synthesizer-v1',
    leftHeadlines,
    centerHeadlines,
    rightHeadlines
  });
});

// ---------------------------------------------------- Initialization
async function start() {
  // Check if original python stories.json exists and copy it for immediate bootstrap
  const originalStoriesPath = path.join(__dirname, '..', '..', 'groundish-news', 'data', 'stories.json');
  const localCachePath = path.join(__dirname, 'data', 'stories.json');

  if (!fs.existsSync(localCachePath) && fs.existsSync(originalStoriesPath)) {
    try {
      fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
      fs.copyFileSync(originalStoriesPath, localCachePath);
      console.log('[Bootstrap] Initialized dataset from groundish-news data cache.');
    } catch (e) {
      console.warn('[Bootstrap] Could not seed cache:', e.message);
    }
  }

  // Load local cache
  loadLocalCache();

  // Try MongoDB connection (graceful fallback if MongoDB is not running)
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
    console.log('[MongoDB] Connected successfully to', MONGODB_URI);
  } catch (err) {
    console.log('[MongoDB] Notice: MongoDB not connected (running in high-speed In-Memory / JSON Cache mode).');
  }

  // If no data loaded, run pipeline in background
  if (!state.data) {
    console.log('[Pipeline] No existing dataset found. Launching initial feed fetch in background...');
    runPipeline().catch(e => console.warn('[Initial Pipeline]', e.message));
  }

  // Schedule auto-refresh every 20 minutes
  cron.schedule('*/20 * * * *', () => {
    console.log('[Cron] Scheduled 20-min feed refresh starting...');
    runPipeline().catch(e => console.warn('[Cron Refresh]', e.message));
  });

  app.listen(PORT, () => {
    console.log(`[Groundish MERN Backend] Server listening at http://localhost:${PORT}`);
  });
}

start();
