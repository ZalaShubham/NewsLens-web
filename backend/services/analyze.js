import { BUCKETS } from './sources.js';

const FACTUALITY_SCORE = { high: 1.0, 'mostly-high': 0.75, mixed: 0.45, low: 0.1 };
const MIN_OUTLETS_FOR_BLINDSPOT = 4;
const BLINDSPOT_SILENT_RATE = 0.08;
const BLINDSPOT_LOUD_RATE = 0.12;
const BLINDSPOT_LOUD_OUTLETS = 2;
const BLINDSPOT_RATIO = 2.2;
const OWNER_CONCENTRATION = 0.30;

function camp(lean) {
  if (lean === null || lean === undefined) return null;
  if (lean < 0) return 'left';
  if (lean > 0) return 'right';
  return 'center';
}

export function calculatePoolSizes(articles) {
  const live = { left: new Set(), center: new Set(), right: new Set() };
  for (const art of articles) {
    const c = camp(art.lean);
    if (c && live[c]) {
      live[c].add(art.source_id);
    }
  }
  return {
    left: Math.max(live.left.size, 1),
    center: Math.max(live.center.size, 1),
    right: Math.max(live.right.size, 1)
  };
}

function calculateBlindspot(uniqueArticles, pools) {
  const rated = uniqueArticles.filter(a => a.lean !== null && a.lean !== undefined);
  const distinctOutlets = new Set(rated.map(a => a.source_id)).size;
  if (distinctOutlets < MIN_OUTLETS_FOR_BLINDSPOT) return null;

  const counts = { left: 0, center: 0, right: 0 };
  const seen = new Set();
  for (const art of rated) {
    if (!seen.has(art.source_id)) {
      seen.add(art.source_id);
      const c = camp(art.lean);
      if (c) counts[c]++;
    }
  }

  const rateLeft = counts.left / pools.left;
  const rateRight = counts.right / pools.right;

  // Blindspot on Right (Left covered it, Right ignored it)
  if (rateRight <= BLINDSPOT_SILENT_RATE &&
      rateLeft >= BLINDSPOT_LOUD_RATE &&
      counts.left >= BLINDSPOT_LOUD_OUTLETS &&
      rateLeft >= rateRight * BLINDSPOT_RATIO) {
    return 'right';
  }

  // Blindspot on Left (Right covered it, Left ignored it)
  if (rateLeft <= BLINDSPOT_SILENT_RATE &&
      rateRight >= BLINDSPOT_LOUD_RATE &&
      counts.right >= BLINDSPOT_LOUD_OUTLETS &&
      rateRight >= rateLeft * BLINDSPOT_RATIO) {
    return 'left';
  }

  return null;
}

function selectFraming(articles) {
  const buckets = {};
  for (const b of BUCKETS) {
    buckets[b.slug] = {
      lean_slug: b.slug,
      lean_label: b.label,
      count: 0,
      articles: []
    };
  }

  for (const art of articles) {
    if (art.lean_slug && buckets[art.lean_slug]) {
      buckets[art.lean_slug].count++;
      buckets[art.lean_slug].articles.push(art);
    }
  }

  const framing = [];
  for (const b of BUCKETS) {
    const bucket = buckets[b.slug];
    if (bucket.count > 0) {
      // Pick best representative article (prefer high factuality and concise headline)
      bucket.articles.sort((a, b) => (FACTUALITY_SCORE[b.factuality] || 0.5) - (FACTUALITY_SCORE[a.factuality] || 0.5));
      const rep = bucket.articles[0];
      framing.push({
        lean_slug: b.slug,
        lean_label: b.label,
        count: bucket.count,
        article: {
          title: rep.title,
          source: rep.source,
          url: rep.url,
          factuality: rep.factuality
        }
      });
    }
  }
  return framing;
}

function selectRepresentativeTitle(articles) {
  // Prefer center or high-factuality source for the main headline
  const rated = [...articles].sort((a, b) => {
    const aScore = (a.lean === 0 ? 0.3 : 0) + (FACTUALITY_SCORE[a.factuality] || 0.5);
    const bScore = (b.lean === 0 ? 0.3 : 0) + (FACTUALITY_SCORE[b.factuality] || 0.5);
    return bScore - aScore;
  });
  return rated[0]?.title || articles[0]?.title || 'Untitled Story';
}

function selectSummary(articles) {
  // Find longest informative summary
  for (const art of articles) {
    if (art.summary && art.summary.length > 80) {
      return art.summary;
    }
  }
  return articles[0]?.summary || '';
}

export function buildStoryFromCluster(cluster, pools) {
  // Deduplicate articles from same source
  const seenSources = new Set();
  const uniqueArticles = [];
  for (const art of cluster) {
    if (!seenSources.has(art.source_id)) {
      seenSources.add(art.source_id);
      uniqueArticles.push(art);
    }
  }

  const rated = uniqueArticles.filter(a => a.lean !== null && a.lean !== undefined);
  const totalRated = rated.length;

  // Bias breakdown percentages
  let leftCount = 0;
  let centerCount = 0;
  let rightCount = 0;
  let skewSum = 0;

  for (const art of rated) {
    const c = camp(art.lean);
    if (c === 'left') leftCount++;
    else if (c === 'right') rightCount++;
    else centerCount++;
    skewSum += art.lean;
  }

  const breakdown = {
    left: totalRated > 0 ? Math.round((leftCount / totalRated) * 100) : 0,
    center: totalRated > 0 ? Math.round((centerCount / totalRated) * 100) : 0,
    right: totalRated > 0 ? Math.round((rightCount / totalRated) * 100) : 0
  };

  // Adjust rounding to equal 100
  const sum = breakdown.left + breakdown.center + breakdown.right;
  if (totalRated > 0 && sum !== 100) {
    breakdown.center += (100 - sum);
  }

  const skew = totalRated > 0 ? skewSum / totalRated : 0;
  const blindspot = calculateBlindspot(uniqueArticles, pools);

  // Ownership concentration
  const ownerCounts = {};
  for (const art of uniqueArticles) {
    if (art.owner) {
      ownerCounts[art.owner] = (ownerCounts[art.owner] || 0) + 1;
    }
  }
  const owners = Object.entries(ownerCounts)
    .map(([name, count]) => [name, count])
    .sort((a, b) => b[1] - a[1]);

  // Factuality distribution
  let factualitySum = 0;
  for (const art of uniqueArticles) {
    factualitySum += FACTUALITY_SCORE[art.factuality] || 0.5;
  }
  const avgFactuality = uniqueArticles.length > 0 ? factualitySum / uniqueArticles.length : 0.75;

  // Published timestamps
  const timestamps = uniqueArticles.map(a => a.published_ts).filter(Boolean);
  const lastPublished = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : new Date().toISOString();

  // Distinct countries
  const countries = Array.from(new Set(uniqueArticles.map(a => a.country).filter(Boolean)));

  // Generate unique story ID
  const title = selectRepresentativeTitle(uniqueArticles);
  const id = `story-${Math.abs(hashString(title + (uniqueArticles[0]?.id || '')))}`;

  // Ranking calculation (outlets count + factuality + recency boost)
  const rank = uniqueArticles.length * 10 + avgFactuality * 5;

  return {
    id,
    title,
    summary: selectSummary(uniqueArticles),
    rank,
    outlet_count: uniqueArticles.length,
    rated_count: totalRated,
    skew,
    bias_breakdown: breakdown,
    blindspot,
    framing: selectFraming(uniqueArticles),
    owners,
    countries,
    last_published: lastPublished,
    articles: uniqueArticles
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function analyzeCorpus(articles, clusters, report, minOutlets = 2) {
  const pools = calculatePoolSizes(articles);
  const stories = [];

  for (const cluster of clusters) {
    if (cluster.length >= minOutlets) {
      const story = buildStoryFromCluster(cluster, pools);
      stories.push(story);
    }
  }

  // Sort by ranking score descending
  stories.sort((a, b) => b.rank - a.rank);

  const blindspots = {
    left: stories.filter(s => s.blindspot === 'left').length,
    right: stories.filter(s => s.blindspot === 'right').length
  };

  const sourcesOk = report.filter(r => r.feeds_ok > 0).length;

  const meta = {
    article_count: articles.length,
    story_count: stories.length,
    source_count: report.length,
    sources_ok: sourcesOk,
    blindspots,
    updated_at: new Date().toISOString()
  };

  return { stories, meta, pools };
}
