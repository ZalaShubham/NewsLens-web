import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { SOURCES } from './sources.js';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const TIMEOUT_MS = 12000;
const TAG_RE = /<[^>]+>/g;
const WS_RE = /\s+/g;
const GNEWS_SUFFIX_RE = /\s+-\s+[A-Z][\w.&' ]{2,30}$/;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  trimValues: true,
  cdataPropName: '__cdata'
});

function cleanText(text) {
  if (!text) return '';
  if (typeof text === 'object') {
    text = text.__cdata || text['#text'] || '';
  }
  return String(text)
    .replace(TAG_RE, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(WS_RE, ' ')
    .trim();
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function extractLink(item) {
  if (!item) return '';
  if (typeof item.link === 'string') return item.link.trim();
  if (Array.isArray(item.link)) {
    const alt = item.link.find(l => l['@_rel'] === 'alternate');
    if (alt && alt['@_href']) return alt['@_href'].trim();
    const first = item.link[0];
    if (typeof first === 'string') return first.trim();
    if (first && first['@_href']) return first['@_href'].trim();
  }
  if (item.link && typeof item.link === 'object') {
    if (item.link['@_href']) return item.link['@_href'].trim();
    if (item.link.__cdata) return item.link.__cdata.trim();
    if (item.link['#text']) return item.link['#text'].trim();
  }
  if (item.guid) {
    if (typeof item.guid === 'string' && item.guid.startsWith('http')) return item.guid.trim();
    if (item.guid['#text'] && item.guid['#text'].startsWith('http')) return item.guid['#text'].trim();
  }
  if (item.id && typeof item.id === 'string' && item.id.startsWith('http')) {
    return item.id.trim();
  }
  return '';
}

function parseFeedXml(xmlStr, source) {
  const articles = [];
  try {
    const data = parser.parse(xmlStr);
    
    // RSS 2.0 / 0.92
    let items = data?.rss?.channel?.item;
    // Atom
    if (!items) items = data?.feed?.entry;
    // RDF / RSS 1.0
    if (!items && data?.['rdf:RDF']) {
      items = data['rdf:RDF'].item;
    }

    if (!items) return articles;
    if (!Array.isArray(items)) items = [items];

    for (const item of items) {
      let rawTitle = cleanText(item.title);
      if (source.name === 'Associated Press' || source.name === 'Reuters') {
        rawTitle = rawTitle.replace(GNEWS_SUFFIX_RE, '');
      }
      if (!rawTitle || rawTitle.length < 10) continue;

      const url = extractLink(item);
      if (!url) continue;

      const summary = cleanText(item.description || item.summary || item['content:encoded'] || item.content);
      const pubDate = parseDate(item.pubDate || item.published || item.updated || item['dc:date'] || item.date);

      articles.push({
        id: `${source.id}-${Math.abs(hashString(url))}`,
        source_id: source.id,
        source: source.name,
        lean: source.lean,
        lean_slug: source.lean_slug,
        lean_label: source.lean_label,
        factuality: source.factuality,
        owner: source.owner,
        country: source.country,
        title: rawTitle,
        summary: summary.slice(0, 500),
        url,
        published: pubDate ? pubDate.toISOString() : new Date().toISOString(),
        published_ts: pubDate ? pubDate.getTime() : Date.now()
      });
    }
  } catch (err) {
    // Malformed XML or partial feed
  }
  return articles;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export async function fetchFeed(url, source) {
  try {
    const res = await axios.get(url, {
      timeout: TIMEOUT_MS,
      headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }
    });
    const articles = parseFeedXml(res.data, source);
    return { ok: true, articles, error: null };
  } catch (err) {
    return { ok: false, articles: [], error: err.message };
  }
}

export async function fetchAllFeeds(log = console.log) {
  const allArticles = [];
  const report = [];
  const seenUrls = new Set();

  log(`[Fetcher] Polling ${SOURCES.length} news sources...`);

  // Parallel fetch with concurrency chunking
  const tasks = SOURCES.map(async (source) => {
    let sourceArticles = [];
    let feedsOk = 0;
    let lastError = null;

    for (const url of source.urls) {
      const res = await fetchFeed(url, source);
      if (res.ok) {
        feedsOk++;
        for (const art of res.articles) {
          if (!seenUrls.has(art.url)) {
            seenUrls.add(art.url);
            sourceArticles.push(art);
          }
        }
      } else {
        lastError = res.error;
      }
    }

    report.push({
      source_id: source.id,
      name: source.name,
      lean_slug: source.lean_slug,
      feeds: source.urls.length,
      feeds_ok: feedsOk,
      count: sourceArticles.length,
      error: feedsOk === 0 ? lastError : null
    });

    return sourceArticles;
  });

  const results = await Promise.all(tasks);
  for (const list of results) {
    allArticles.push(...list);
  }

  const okSources = report.filter(r => r.feeds_ok > 0).length;
  log(`[Fetcher] Fetched ${allArticles.length} articles from ${okSources}/${SOURCES.length} sources.`);

  return { articles: allArticles, report };
}
