import './loadEnv.js';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { extname } from 'path';
import {
  getPublishedArticles,
  getArticleBySlug,
  getAllArticles,
  getPublishedVideos,
  getAllVideos,
  slugExists,
  createArticle,
  updateArticle,
  deleteArticle,
  createVideo,
  updateVideo,
  deleteVideo,
} from './sanity.js';
import { MAX_PDF_BYTES, MAX_ARTICLES } from './constants.js';
import { jsonBodyMiddleware } from './jsonBody.js';

const CMS_PASSWORD = process.env.CMS_PASSWORD || 'dhanz2026';

const MARKET_SYMBOLS = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^BSESN', name: 'SENSEX' },
  { symbol: '^NSEBANK', name: 'BANK NIFTY' },
  { symbol: '^CNXIT', name: 'NIFTY IT' },
  { symbol: '^CNXAUTO', name: 'NIFTY AUTO' },
  { symbol: 'INR=X', name: 'USD/INR' },
];

let marketCache = { rates: [], updatedAt: null, fetchedAt: 0 };
const MARKET_CACHE_MS = 30000;

export const app = express();
app.use(cors({ origin: true }));
app.use(express.json({
  limit: '6mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(jsonBodyMiddleware);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    sanityProject: process.env.SANITY_PROJECT_ID || '6992crjl',
    hasSanityToken: Boolean(process.env.SANITY_WRITE_TOKEN?.trim()),
    limits: { maxPdfMb: 1, maxArticles: MAX_ARTICLES },
  });
});

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) return match[1];
  }
  return null;
}

function authMiddleware(req, res, next) {
  const password = req.headers['x-cms-password'];
  if (password !== CMS_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

async function fetchYahooChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Chart fetch failed for ${symbol}`);
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No chart data for ${symbol}`);
  return meta;
}

async function fetchMarketRates() {
  const now = Date.now();
  if (marketCache.fetchedAt && now - marketCache.fetchedAt < MARKET_CACHE_MS) {
    return marketCache;
  }

  const results = await Promise.allSettled(
    MARKET_SYMBOLS.map((item) => fetchYahooChart(item.symbol))
  );

  const rates = MARKET_SYMBOLS.map((item, index) => {
    const result = results[index];
    if (result.status !== 'fulfilled') {
      return { ...item, price: null, change: null, changePercent: null };
    }
    const meta = result.value;
    const price = meta.regularMarketPrice ?? meta.previousClose ?? null;
    const change = meta.regularMarketChange
      ?? (price != null && meta.chartPreviousClose != null ? price - meta.chartPreviousClose : null);
    const changePercent = meta.regularMarketChangePercent
      ?? (change != null && meta.chartPreviousClose ? (change / meta.chartPreviousClose) * 100 : null);
    return { symbol: item.symbol, name: item.name, price, change, changePercent };
  });

  const validRates = rates.filter((r) => r.price != null);
  if (!validRates.length) throw new Error('Market data unavailable');

  marketCache = { rates, updatedAt: new Date().toISOString(), fetchedAt: now };
  return marketCache;
}

app.get('/api/articles', async (_req, res) => {
  try {
    res.json(await getPublishedArticles());
  } catch {
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await getArticleBySlug(req.params.slug);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch {
    res.status(500).json({ error: 'Failed to load article' });
  }
});

app.get('/api/admin/articles', authMiddleware, async (_req, res) => {
  try {
    res.json(await getAllArticles());
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load articles' });
  }
});

app.post('/api/admin/articles', authMiddleware, upload.single('pdf'), async (req, res) => {
  try {
    const { title, description, published } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const existing = await getAllArticles();
    if (existing.length >= MAX_ARTICLES) {
      return res.status(400).json({
        error: `Maximum ${MAX_ARTICLES} PDF articles allowed. Delete one before uploading a new article.`,
      });
    }

    let slug = slugify(title);
    if (await slugExists(slug)) slug = `${slug}-${Date.now()}`;

    const article = await createArticle({
      title: title.trim(),
      slug,
      description: description?.trim() || '',
      published: published === 'true' || published === true,
      pdfBuffer: req.file.buffer,
      filename: req.file.originalname || `article${extname(req.file.originalname) || '.pdf'}`,
    });

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create article' });
  }
});

app.patch('/api/admin/articles/:id', authMiddleware, async (req, res) => {
  try {
    const article = await updateArticle(req.params.id, req.body);
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update article' });
  }
});

app.delete('/api/admin/articles/:id', authMiddleware, async (req, res) => {
  try {
    await deleteArticle(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete article' });
  }
});

app.get('/api/market-rates', async (_req, res) => {
  try {
    const data = await fetchMarketRates();
    res.json({ rates: data.rates, updatedAt: data.updatedAt });
  } catch {
    res.json({ rates: marketCache.rates, updatedAt: marketCache.updatedAt, stale: true });
  }
});

app.get('/api/videos', async (_req, res) => {
  try {
    res.json(await getPublishedVideos());
  } catch {
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

app.get('/api/admin/videos', authMiddleware, async (_req, res) => {
  try {
    res.json(await getAllVideos());
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load videos' });
  }
});

app.post('/api/admin/videos', authMiddleware, async (req, res) => {
  try {
    const { title, description, youtubeUrl, published } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    const video = await createVideo({
      title: title.trim(),
      description: description?.trim() || '',
      youtubeUrl: youtubeUrl.trim(),
      videoId,
      published: published === true || published === 'true',
    });

    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create video' });
  }
});

app.patch('/api/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, youtubeUrl, published } = req.body;
    const updates = { title, description, published };
    if (youtubeUrl) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });
      updates.youtubeUrl = youtubeUrl;
      updates.videoId = videoId;
    }
    const video = await updateVideo(req.params.id, updates);
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update video' });
  }
});

app.delete('/api/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    await deleteVideo(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete video' });
  }
});

app.use((err, _req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'PDF must be 1 MB or smaller.' });
  }
  if (err?.name === 'MulterError') {
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
  next(err);
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || 'Upload failed' });
});
