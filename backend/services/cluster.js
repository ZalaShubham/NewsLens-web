/**
 * Group articles from different outlets into stories.
 * 
 * 1. TF-IDF vectors over headline tokens (summary contributes lower weight).
 * 2. Inverted index on discriminative tokens gives candidate pairs.
 * 3. Average-link agglomerative clustering: pairs are considered strongest-first,
 *    and clusters join only if centroids are similar enough.
 */

const TOKEN_RE = /[a-z0-9']+/g;

const STOPWORDS = new Set(`
a about above after again against all am an and any are aren't as at be because been
before being below between both but by can cannot could couldn't did didn't do does
doesn't doing don't down during each few for from further had hadn't has hasn't have
haven't having he he'd he'll he's her here here's hers herself him himself his how
how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more most
mustn't my myself no nor not of off on once only or other ought our ours ourselves out
over own same shan't she she'd she'll she's should shouldn't so some such than that
that's the their theirs them themselves then there there's these they they'd they'll
they're they've this those through to too under until up very was wasn't we we'd we'll
we're we've were weren't what what's when when's where where's which while who who's
whom why why's with won't would wouldn't you you'd you'll you're you've your yours
yourself yourselves
says said say saying new news report reports reported amid over back may might will
just like get gets got make makes made take takes taken first last one two three
year years day days week weeks month months time times today yesterday tomorrow
top best worst big biggest live update updates latest video watch photos opinion
analysis exclusive breaking heres whats trump's people man woman
`.trim().split(/\s+/));

const MAX_BLOCK_DF = 0.06;
const MIN_BLOCK_DF = 2;
const SIM_THRESHOLD = 0.32;
const MIN_SHARED = 2;
const MAX_GAP_DAYS = 6.0;

export function tokenize(text) {
  if (!text) return [];
  const matches = (text.toLowerCase().match(TOKEN_RE) || []);
  return matches.filter(t => !STOPWORDS.has(t) && (t.length > 2 || /^\d+$/.test(t)));
}

export function buildVectors(articles, summaryWeight = 0.35) {
  const raw = [];
  const df = {};

  for (const art of articles) {
    const counts = {};
    for (const t of tokenize(art.title)) {
      counts[t] = (counts[t] || 0) + 1.0;
    }
    for (const t of tokenize(art.summary)) {
      counts[t] = (counts[t] || 0) + summaryWeight;
    }
    for (const token of Object.keys(counts)) {
      df[token] = (df[token] || 0) + 1;
    }
    raw.push(counts);
  }

  const N = Math.max(articles.length, 1);
  const vectors = [];

  for (const counts of raw) {
    const weighted = {};
    let sumSq = 0;
    for (const [token, count] of Object.entries(counts)) {
      const docFreq = df[token] || 1;
      const idf = Math.log(1 + N / docFreq);
      const w = count * idf;
      weighted[token] = w;
      sumSq += w * w;
    }
    const norm = Math.sqrt(sumSq) || 1.0;
    const normalized = {};
    for (const [t, w] of Object.entries(weighted)) {
      normalized[t] = w / norm;
    }
    vectors.push(normalized);
  }

  return { vectors, df };
}

export function dot(v1, v2) {
  let score = 0;
  const [small, big] = Object.keys(v1).length < Object.keys(v2).length ? [v1, v2] : [v2, v1];
  for (const [token, weight] of Object.entries(small)) {
    if (big[token]) {
      score += weight * big[token];
    }
  }
  return score;
}

export function findCandidatePairs(articles, vectors, df) {
  const N = articles.length;
  const maxDf = Math.max(2, Math.floor(N * MAX_BLOCK_DF));
  const posting = {};

  // Build inverted index of discriminative tokens
  for (let i = 0; i < articles.length; i++) {
    for (const token of Object.keys(vectors[i])) {
      const docFreq = df[token] || 0;
      if (docFreq >= MIN_BLOCK_DF && docFreq <= maxDf) {
        if (!posting[token]) posting[token] = [];
        posting[token].push(i);
      }
    }
  }

  const shared = {};
  for (const docIds of Object.values(posting)) {
    if (docIds.length > 80) continue;
    for (let p = 0; p < docIds.length; p++) {
      for (let q = p + 1; q < docIds.length; q++) {
        const i = docIds[p];
        const j = docIds[q];
        const key = `${i},${j}`;
        shared[key] = (shared[key] || 0) + 1;
      }
    }
  }

  const maxGapMs = MAX_GAP_DAYS * 86400 * 1000;
  const pairs = [];

  for (const [key, count] of Object.entries(shared)) {
    if (count < MIN_SHARED) continue;
    const [iStr, jStr] = key.split(',');
    const i = parseInt(iStr, 10);
    const j = parseInt(jStr, 10);

    const artA = articles[i];
    const artB = articles[j];

    // Same outlet with different story?
    if (artA.source_id === artB.source_id && artA.id !== artB.id) {
      continue;
    }

    // Time gap check
    if (artA.published_ts && artB.published_ts) {
      if (Math.abs(artA.published_ts - artB.published_ts) > maxGapMs) {
        continue;
      }
    }

    const sim = dot(vectors[i], vectors[j]);
    if (sim >= SIM_THRESHOLD) {
      pairs.push({ sim, i, j });
    }
  }

  // Sort candidate pairs highest-similarity first
  pairs.sort((a, b) => b.sim - a.sim);
  return pairs;
}

export function clusterArticles(articles) {
  if (articles.length === 0) return [];
  if (articles.length === 1) return [[articles[0]]];

  const { vectors, df } = buildVectors(articles);
  const pairs = findCandidatePairs(articles, vectors, df);

  // Union-Find with centroid maintenance
  const parent = articles.map((_, idx) => idx);
  const clusterMembers = articles.map((_, idx) => [idx]);
  const centroids = vectors.map(v => ({ ...v }));

  function find(i) {
    let root = i;
    while (root !== parent[root]) root = parent[root];
    let curr = i;
    while (curr !== root) {
      const nxt = parent[curr];
      parent[curr] = root;
      curr = nxt;
    }
    return root;
  }

  for (const { sim, i, j } of pairs) {
    const rootA = find(i);
    const rootB = find(j);
    if (rootA === rootB) continue;

    // Check centroid similarity to avoid chaining dissimilar stories
    const cSim = dot(centroids[rootA], centroids[rootB]);
    if (cSim < SIM_THRESHOLD * 0.85) continue;

    // Merge smaller into larger
    const [dest, src] = clusterMembers[rootA].length >= clusterMembers[rootB].length
      ? [rootA, rootB]
      : [rootB, rootA];

    parent[src] = dest;
    clusterMembers[dest].push(...clusterMembers[src]);
    clusterMembers[src] = [];

    // Recompute centroid for merged cluster
    const newCentroid = {};
    let sumSq = 0;
    for (const docIdx of clusterMembers[dest]) {
      for (const [t, w] of Object.entries(vectors[docIdx])) {
        newCentroid[t] = (newCentroid[t] || 0) + w;
      }
    }
    for (const val of Object.values(newCentroid)) {
      sumSq += val * val;
    }
    const norm = Math.sqrt(sumSq) || 1.0;
    for (const t of Object.keys(newCentroid)) {
      newCentroid[t] /= norm;
    }
    centroids[dest] = newCentroid;
  }

  const clusters = [];
  for (let idx = 0; idx < articles.length; idx++) {
    if (parent[idx] === idx && clusterMembers[idx].length > 0) {
      clusters.push(clusterMembers[idx].map(docIdx => articles[docIdx]));
    }
  }

  // Sort clusters largest first
  clusters.sort((a, b) => b.length - a.length);
  return clusters;
}
