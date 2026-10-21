/**
 * Source registry: The news feeds Groundish pulls, plus metadata for bias, factuality, owner, country.
 * Bias scale: -2 Left, -1 Lean Left, 0 Center, +1 Lean Right, +2 Right.
 */

export const BUCKETS = [
  { lean: -2, slug: 'left', label: 'Left' },
  { lean: -1, slug: 'lean_left', label: 'Lean Left' },
  { lean: 0, slug: 'center', label: 'Center' },
  { lean: 1, slug: 'lean_right', label: 'Lean Right' },
  { lean: 2, slug: 'right', label: 'Right' },
];

export const LEAN_SLUG = {
  '-2': 'left',
  '-1': 'lean_left',
  '0': 'center',
  '1': 'lean_right',
  '2': 'right'
};

export const LEAN_LABEL = {
  '-2': 'Left',
  '-1': 'Lean Left',
  '0': 'Center',
  '1': 'Lean Right',
  '2': 'Right'
};

function S(id, name, urls, lean, factuality, owner, country = 'US') {
  const urlList = Array.isArray(urls) ? urls : [urls];
  return {
    id,
    name,
    urls: urlList,
    url: urlList[0],
    lean,
    lean_slug: LEAN_SLUG[lean],
    lean_label: LEAN_LABEL[lean],
    factuality, // high | mostly-high | mixed | low
    owner,
    country
  };
}

export const SOURCES = [
  // ---------------------------------------------------------------- Left (-2)
  S('motherjones', 'Mother Jones', 'https://www.motherjones.com/feed/', -2, 'mostly-high', 'Foundation for National Progress'),
  S('intercept', 'The Intercept', 'https://theintercept.com/feed/?rss', -2, 'mostly-high', 'First Look Institute'),
  S('vox', 'Vox', 'https://www.vox.com/rss/index.xml', -2, 'mostly-high', 'Vox Media'),
  S('slate', 'Slate', 'https://slate.com/feeds/all.rss', -2, 'mixed', 'Graham Holdings'),
  S('dailybeast', 'The Daily Beast', 'https://www.thedailybeast.com/arc/outboundfeeds/rss/', -2, 'mixed', 'IAC'),
  S('huffpost', 'HuffPost', 'https://www.huffpost.com/section/politics/feed', -2, 'mixed', 'BuzzFeed, Inc.'),
  S('newyorker', 'The New Yorker', 'https://www.newyorker.com/feed/news', -2, 'high', 'Advance Publications'),
  S('jacobin', 'Jacobin', 'https://jacobin.com/feed/', -2, 'mixed', 'Jacobin Foundation'),
  S('commondreams', 'Common Dreams', 'https://www.commondreams.org/feeds/news.rss', -2, 'mixed', 'Common Dreams'),
  S('truthout', 'Truthout', 'https://truthout.org/feed/', -2, 'mixed', 'Truthout'),

  // ----------------------------------------------------------- Lean Left (-1)
  S('nyt', 'The New York Times', [
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/US.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'
  ], -1, 'high', 'The New York Times Company'),
  S('wapo', 'The Washington Post', [
    'https://feeds.washingtonpost.com/rss/national',
    'https://feeds.washingtonpost.com/rss/politics',
    'https://feeds.washingtonpost.com/rss/world'
  ], -1, 'high', 'Nash Holdings'),
  S('npr', 'NPR', [
    'https://feeds.npr.org/1001/rss.xml',
    'https://feeds.npr.org/1014/rss.xml',
    'https://feeds.npr.org/1003/rss.xml'
  ], -1, 'high', 'NPR (nonprofit)'),
  S('pbs', 'PBS NewsHour', 'https://www.pbs.org/newshour/feeds/rss/headlines', -1, 'high', 'PBS (nonprofit)'),
  S('cnn', 'CNN', [
    'http://rss.cnn.com/rss/cnn_topstories.rss',
    'http://rss.cnn.com/rss/cnn_allpolitics.rss',
    'http://rss.cnn.com/rss/cnn_us.rss',
    'http://rss.cnn.com/rss/cnn_world.rss'
  ], -1, 'mostly-high', 'Warner Bros. Discovery'),
  S('nbc', 'NBC News', [
    'https://feeds.nbcnews.com/nbcnews/public/news',
    'https://feeds.nbcnews.com/nbcnews/public/politics',
    'https://feeds.nbcnews.com/nbcnews/public/world'
  ], -1, 'mostly-high', 'Comcast / NBCUniversal'),
  S('cbs', 'CBS News', [
    'https://www.cbsnews.com/latest/rss/main',
    'https://www.cbsnews.com/latest/rss/politics',
    'https://www.cbsnews.com/latest/rss/world'
  ], -1, 'mostly-high', 'Paramount Skydance'),
  S('abc', 'ABC News', [
    'https://abcnews.go.com/abcnews/topstories',
    'https://abcnews.go.com/abcnews/politicsheadlines',
    'https://abcnews.go.com/abcnews/internationalheadlines'
  ], -1, 'mostly-high', 'The Walt Disney Company'),
  S('politico', 'Politico', [
    'https://rss.politico.com/politics-news.xml',
    'https://rss.politico.com/congress.xml'
  ], -1, 'mostly-high', 'Axel Springer'),
  S('businessinsider', 'Business Insider', 'https://www.businessinsider.com/rss', -1, 'mixed', 'Axel Springer'),
  S('atlantic', 'The Atlantic', 'https://www.theatlantic.com/feed/all/', -1, 'mostly-high', 'Emerson Collective'),
  S('time', 'TIME', 'https://time.com/feed/', -1, 'mostly-high', 'Marc & Lynne Benioff'),
  S('latimes', 'Los Angeles Times', 'https://www.latimes.com/rss2.0.xml', -1, 'mostly-high', 'Patrick Soon-Shiong'),
  S('axios', 'Axios', 'https://api.axios.com/feed/', -1, 'high', 'Cox Enterprises'),
  S('bloomberg', 'Bloomberg', 'https://feeds.bloomberg.com/politics/news.rss', -1, 'high', 'Bloomberg L.P.'),
  S('guardian', 'The Guardian', [
    'https://www.theguardian.com/us-news/rss',
    'https://www.theguardian.com/world/rss',
    'https://www.theguardian.com/politics/rss'
  ], -1, 'mostly-high', 'Scott Trust Limited', 'UK'),
  S('independent', 'The Independent', 'https://www.independent.co.uk/news/uk/rss', -1, 'mixed', 'Independent Digital News & Media', 'UK'),
  S('channel4', 'Channel 4 News', 'https://www.channel4.com/news/feed', -1, 'high', 'Channel Four Television Corp', 'UK'),
  S('aljazeera', 'Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml', -1, 'mixed', 'Qatar Media Corporation (state)', 'QA'),
  S('cbc', 'CBC News', 'https://www.cbc.ca/webfeed/rss/rss-topstories', -1, 'high', 'CBC (Canadian public)', 'CA'),
  S('globalnews', 'Global News', 'https://globalnews.ca/feed/', -1, 'mostly-high', 'Corus Entertainment', 'CA'),

  // -------------------------------------------------------------- Center (0)
  S('ap', 'Associated Press', [
    'https://news.google.com/rss/search?q=when:2d+site:apnews.com&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=when:2d+site:apnews.com+politics&hl=en-US&gl=US&ceid=US:en'
  ], 0, 'high', 'AP (nonprofit cooperative)'),
  S('reuters', 'Reuters', [
    'https://news.google.com/rss/search?q=when:2d+site:reuters.com&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=when:2d+site:reuters.com+US&hl=en-US&gl=US&ceid=US:en'
  ], 0, 'high', 'Thomson Reuters'),
  S('bbc', 'BBC News', [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://feeds.bbci.co.uk/news/politics/rss.xml'
  ], 0, 'high', 'BBC (UK public)', 'UK'),
  S('csmonitor', 'Christian Science Monitor', 'https://rss.csmonitor.com/feeds/usa', 0, 'high', 'Christian Science Publishing Society'),
  S('thehill', 'The Hill', [
    'https://thehill.com/news/feed/',
    'https://thehill.com/homenews/feed/',
    'https://thehill.com/policy/feed/'
  ], 0, 'mostly-high', 'Nexstar Media Group'),
  S('newsweek', 'Newsweek', 'https://www.newsweek.com/rss', 0, 'mixed', 'Newsweek Publishing LLC'),
  S('cnbc', 'CNBC', 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', 0, 'mostly-high', 'Comcast / NBCUniversal'),
  S('marketwatch', 'MarketWatch', 'https://feeds.content.dowjones.io/public/rss/mw_topstories', 0, 'mostly-high', 'News Corp'),
  S('forbes', 'Forbes', 'https://www.forbes.com/business/feed/', 0, 'mixed', 'Integrated Whale Media'),
  S('upi', 'UPI', [
    'https://rss.upi.com/news/top_news.rss',
    'https://rss.upi.com/news/us_news.rss'
  ], 0, 'mostly-high', 'News World Communications'),
  S('dw', 'Deutsche Welle', 'https://rss.dw.com/rdf/rss-en-all', 0, 'high', 'DW (German public)', 'DE'),
  S('france24', 'France 24', 'https://www.france24.com/en/rss', 0, 'high', 'France Medias Monde (state)', 'FR'),
  S('sky', 'Sky News', 'https://feeds.skynews.com/feeds/rss/world.xml', 0, 'mostly-high', 'Comcast / NBCUniversal', 'UK'),
  S('abcau', 'ABC News (Australia)', 'https://www.abc.net.au/news/feed/2942460/rss.xml', 0, 'high', 'ABC (Australian public)', 'AU'),
  S('straitstimes', 'The Straits Times', 'https://www.straitstimes.com/news/world/rss.xml', 0, 'mostly-high', 'SPH Media Trust', 'SG'),
  S('scmp', 'South China Morning Post', 'https://www.scmp.com/rss/91/feed', 0, 'mixed', 'Alibaba Group', 'HK'),
  S('thehindu', 'The Hindu', 'https://www.thehindu.com/news/international/feeder/default.rss', 0, 'mostly-high', 'Kasturi & Sons', 'IN'),
  S('toi', 'Times of India', 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', 0, 'mixed', 'Bennett, Coleman & Co.', 'IN'),
  S('indiatoday', 'India Today', [
    'https://www.indiatoday.in/rss/home',
    'https://www.indiatoday.in/rss/1206550'
  ], 0, 'mostly-high', 'Living Media India Limited', 'IN'),
  S('ndtv', 'NDTV', [
    'https://feeds.feedburner.com/ndtvnews-top-stories',
    'https://feeds.feedburner.com/ndtvnews-india-news'
  ], 0, 'mostly-high', 'AMG Media Networks', 'IN'),
  S('hindustantimes', 'Hindustan Times', [
    'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    'https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml',
    'https://www.hindustantimes.com/feeds/rss/technology/rssfeed.xml'
  ], 0, 'mostly-high', 'HT Media Limited', 'IN'),
  S('indianexpress', 'The Indian Express', 'https://indianexpress.com/section/india/feed/', 0, 'high', 'The Indian Express Group', 'IN'),
  S('businessstandard', 'Business Standard', 'https://www.business-standard.com/rss/latest.rss', 0, 'high', 'Business Standard Limited', 'IN'),
  S('thehindu_sci_tech', 'The Hindu Sci-Tech', 'https://www.thehindu.com/sci-tech/feeder/default.rss', 0, 'mostly-high', 'Kasturi & Sons', 'IN'),
  S('thehindu_business', 'The Hindu Business', 'https://www.thehindu.com/business/feeder/default.rss', 0, 'mostly-high', 'Kasturi & Sons', 'IN'),
  S('thehindu_sport', 'The Hindu Sport', 'https://www.thehindu.com/sport/feeder/default.rss', 0, 'mostly-high', 'Kasturi & Sons', 'IN'),

  // ---------------------------------------------------------- Lean Right (+1)
  S('wsj', 'The Wall Street Journal', 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', 1, 'high', 'News Corp'),
  S('nypost', 'New York Post', [
    'https://nypost.com/feed/',
    'https://nypost.com/us-news/feed/',
    'https://nypost.com/politics/feed/'
  ], 1, 'mixed', 'News Corp'),
  S('washtimes', 'The Washington Times', [
    'https://www.washingtontimes.com/rss/headlines/news/politics/',
    'https://www.washingtontimes.com/rss/headlines/news/national/',
    'https://www.washingtontimes.com/rss/headlines/news/world/'
  ], 1, 'mixed', 'Operations Holdings'),
  S('examiner', 'Washington Examiner', [
    'https://www.washingtonexaminer.com/feed',
    'https://www.washingtonexaminer.com/section/politics/feed',
    'https://www.washingtonexaminer.com/section/news/feed'
  ], 1, 'mostly-high', 'Clarity Media Group'),
  S('nationalreview', 'National Review', [
    'https://www.nationalreview.com/feed/',
    'https://www.nationalreview.com/corner/feed/'
  ], 1, 'mostly-high', 'National Review Institute'),
  S('reason', 'Reason', 'https://reason.com/latest/feed/', 1, 'mostly-high', 'Reason Foundation'),
  S('dispatch', 'The Dispatch', 'https://thedispatch.com/feed/', 1, 'high', 'The Dispatch'),
  S('nationalpost', 'National Post', 'https://nationalpost.com/feed/', 1, 'mostly-high', 'Postmedia Network', 'CA'),

  // --------------------------------------------------------------- Right (+2)
  S('foxnews', 'Fox News', [
    'https://moxie.foxnews.com/google-publisher/latest.xml',
    'https://moxie.foxnews.com/google-publisher/politics.xml',
    'https://moxie.foxnews.com/google-publisher/us.xml',
    'https://moxie.foxnews.com/google-publisher/world.xml'
  ], 2, 'mixed', 'Fox Corporation'),
  S('breitbart', 'Breitbart', 'https://feeds.feedburner.com/breitbart', 2, 'mixed', 'Breitbart News Network'),
  S('dailywire', 'The Daily Wire', 'https://www.dailywire.com/feeds/rss.xml', 2, 'mixed', 'Bentkey Ventures'),
  S('dailycaller', 'The Daily Caller', 'https://dailycaller.com/feed/', 2, 'mixed', 'The Daily Caller Inc.'),
  S('federalist', 'The Federalist', 'https://thefederalist.com/feed/', 2, 'mixed', 'FDRLST Media'),
  S('theblaze', 'The Blaze', [
    'https://www.theblaze.com/feeds/feed.rss',
    'https://www.theblaze.com/feeds/news.rss'
  ], 2, 'mixed', 'Blaze Media'),
  S('freebeacon', 'Washington Free Beacon', 'https://freebeacon.com/feed/', 2, 'mixed', 'Beacon Media'),
  S('justthenews', 'Just the News', 'https://justthenews.com/rss.xml', 2, 'mixed', 'Just the News Inc.'),
  S('oann', 'One America News', 'https://www.oann.com/feed/', 2, 'low', 'Herring Networks'),
  // ----------------------------------------------------------- Indian News Channels (IN)
  // Left (-2)
  S('thewire', 'The Wire', 'https://thewire.in/rss', -2, 'mostly-high', 'Foundation for Independent Journalism', 'IN'),
  S('scrollin', 'Scroll.in', 'https://scroll.in/feed', -2, 'mostly-high', 'Scroll Media Inc.', 'IN'),
  S('frontline', 'Frontline', 'https://frontline.thehindu.com/feeder/default.rss', -2, 'high', 'The Hindu Group (Kasturi & Sons)', 'IN'),
  S('caravan', 'The Caravan', 'https://caravanmagazine.in/feed', -2, 'mostly-high', 'Delhi Press', 'IN'),

  // Lean Left (-1)
  S('thequint', 'The Quint', 'https://www.thequint.com/stories.rss', -1, 'mostly-high', 'Quintillion Media', 'IN'),
  S('telegraphindia', 'The Telegraph India', 'https://www.telegraphindia.com/feeds/rss/india', -1, 'mostly-high', 'ABP Group', 'IN'),
  S('deccanherald', 'Deccan Herald', 'https://www.deccanherald.com/rss/national.rss', -1, 'mostly-high', 'The Printers (Mysore) Ltd.', 'IN'),

  // Center (0)
  S('pti', 'Press Trust of India (PTI)', 'https://www.ptinews.com/rss/national.xml', 0, 'high', 'PTI Non-profit Cooperative', 'IN'),
  S('ani', 'ANI News', 'https://aninews.in/rss/feed/category/national/', 0, 'mostly-high', 'ANI Media Pvt. Ltd.', 'IN'),
  S('livemint', 'Mint / Livemint', 'https://www.livemint.com/rss/news', 0, 'high', 'HT Media Limited', 'IN'),
  S('economictimes', 'The Economic Times', 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', 0, 'mostly-high', 'Times Group', 'IN'),
  S('ddnews', 'DD News', 'https://ddnews.gov.in/feed/', 0, 'high', 'Prasar Bharati (Public Broadcaster)', 'IN'),
  S('outlookindia', 'Outlook India', 'https://www.outlookindia.com/rss/home', 0, 'mostly-high', 'Rajan Raheja Group', 'IN'),
  S('tribuneindia', 'The Tribune India', 'https://www.tribuneindia.com/rss/feed', 0, 'high', 'The Tribune Trust', 'IN'),

  // Lean Right (+1)
  S('firstpost', 'Firstpost', 'https://www.firstpost.com/rss/india.xml', 1, 'mostly-high', 'Network18 (Reliance Industries)', 'IN'),
  S('news18', 'News18 India', 'https://www.news18.com/commonfeeds/v1/eng/rss/india.xml', 1, 'mixed', 'Network18 (Reliance Industries)', 'IN'),
  S('zeenews', 'Zee News', 'https://zeenews.india.com/rss/india-national-news.xml', 1, 'mixed', 'Essel Group', 'IN'),
  S('abpnews', 'ABP News', 'https://news.abplive.com/home/feed', 1, 'mostly-high', 'ABP Group', 'IN'),
  S('financialexpress', 'Financial Express', 'https://www.financialexpress.com/feed/', 1, 'mostly-high', 'The Indian Express Group', 'IN'),

  // Right (+2)
  S('republicworld', 'Republic World', 'https://www.republicworld.com/rss/india-news.xml', 2, 'mixed', 'ARG Outlier Media', 'IN'),
  S('timesnow', 'Times Now', 'https://www.timesnownews.com/feeds/rss/india-news.xml', 2, 'mixed', 'Times Group (Bennett, Coleman & Co.)', 'IN'),
  S('swarajya', 'Swarajya', 'https://swarajyamag.com/rss', 2, 'mostly-high', 'Kovai Media', 'IN'),
  S('opindia', 'OpIndia', 'https://www.opindia.com/feed/', 2, 'mixed', 'Aadhyaasi Media Network', 'IN')

];

export const BY_ID = Object.fromEntries(SOURCES.map(s => [s.id, s]));
