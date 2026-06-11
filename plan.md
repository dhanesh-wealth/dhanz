# Dhanz Wealth — Project Structure & Hosting Plan

This document describes the **current codebase architecture** and **how it is hosted today**. Use it when discussing hosting options (Netlify, Firebase, Render, Vercel, etc.) with another assistant.

---

## 1. Project summary

**Dhanz Wealth** is a wealth-management marketing website with:

- Public pages (home, articles, videos)
- In-browser PDF article viewer
- YouTube video gallery
- Live Indian market ticker (Yahoo Finance proxy)
- Password-protected admin CMS at `/admindhanz`
- Static marketing copy in JSON; dynamic articles/videos in **Sanity.io**

**Live site (current):** `https://dhanz-wealth.netlify.app`  
**GitHub:** connected for Netlify auto-deploy on push to `main`

---

## 2. Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router 7 |
| Styling | Plain CSS + CSS variables (brand colors) |
| Animation | Framer Motion |
| PDF viewer | react-pdf |
| API server | Express 5 (`server/app.js`) |
| CMS database | Sanity.io (project `6992crjl`, dataset `production`) |
| Production API wrapper | Netlify Function + `serverless-http` |
| Local dev | Vite (port 5173) + Express (port 3001) via `concurrently` |
| Optional CMS UI | Sanity Studio in `/sanity` (deployed separately to sanity.io) |

**Not used anymore:** Firebase (Firestore/Storage/Functions were removed earlier).

---

## 3. High-level architecture (production)

```
                    ┌─────────────────────────────────────┐
                    │         Netlify (single site)        │
                    │  https://dhanz-wealth.netlify.app    │
                    └─────────────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
              ▼                                               ▼
   Static files (dist/)                          Netlify Function
   React SPA                                       netlify/functions/api.js
   - /, /articles, /videos                         wraps server/app.js
   - /admindhanz                                   via serverless-http
              │                                               │
              │                                               ▼
              │                                    Sanity.io API
              │                                    (articles, videos, PDF assets)
              │                                               │
              └─────────────────── /api/* ──────────────────────┘
                        (same-origin, no CORS issues)
```

**External services (not hosted in this repo):**

- **Sanity.io** — content + PDF file storage
- **Yahoo Finance** — market data (proxied by API, cached 30s)

---

## 4. Repository structure

```
danz-wealth/
├── src/                    # React frontend
│   ├── pages/              # Home, Articles, ArticleView, Videos, Admin, NotFound
│   ├── components/         # Navbar, Hero, Footer, MarketTicker, PdfViewer, etc.
│   ├── api/                # fetch helpers (articles.js, videos.js, config.js)
│   └── data/
│       └── websiteData.json   # Static site copy, nav, services, contact info
│
├── server/                 # Express API (shared by local dev + Netlify)
│   ├── app.js              # All /api routes
│   ├── sanity.js           # Sanity read/write client
│   ├── loadEnv.js          # Loads .env locally; skips on Lambda/Netlify
│   ├── jsonBody.js         # Fixes JSON body parsing on serverless
│   ├── constants.js        # MAX_PDF_BYTES (1MB), MAX_ARTICLES (4)
│   └── index.js            # Local prod/dev server on PORT (3001)
│
├── netlify/
│   └── functions/
│       └── api.js          # serverless-http entry → imports server/app.js
│
├── sanity/                 # Sanity Studio schemas (optional separate deploy)
├── public/                 # Static assets copied to dist/ (_redirects, icons)
├── dist/                   # Vite build output (published to Netlify)
│
├── netlify.toml            # Build, functions, redirects
├── vite.config.js          # Dev proxy: /api → localhost:3001
├── package.json
├── deploy.md               # Step-by-step Netlify deploy guide
├── do.md                   # Sanity setup guide
└── .env                    # Local secrets only (not committed)
```

---

## 5. Frontend routes

| Path | Page | Notes |
|------|------|--------|
| `/` | Home | Market ticker + hero slider + sections |
| `/articles` | Article list | Mix of JSON predefined + Sanity articles |
| `/articles/:slug` | PDF article view | |
| `/videos` | YouTube gallery | |
| `/admindhanz` | CMS admin login & upload UI | Password: `CMS_PASSWORD` |
| `*` | 404 | No navigation links |

**SPA routing:** `public/_redirects` and `netlify.toml` rewrite unknown paths to `index.html` so refresh works on sub-routes.

---

## 6. API routes (Express — all prefixed `/api`)

### Public

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check + env status |
| GET | `/api/articles` | Published articles |
| GET | `/api/articles/:slug` | Single article |
| GET | `/api/videos` | Published videos |
| GET | `/api/market-rates` | Yahoo Finance proxy (30s cache) |

### Admin (header `x-cms-password: <CMS_PASSWORD>`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/articles` | List all articles |
| POST | `/api/admin/articles` | Upload PDF (multipart, max 1 MB) |
| PATCH | `/api/admin/articles/:id` | Update/publish |
| DELETE | `/api/admin/articles/:id` | Delete |
| GET | `/api/admin/videos` | List all videos |
| POST | `/api/admin/videos` | Add YouTube URL (JSON body) |
| PATCH | `/api/admin/videos/:id` | Update |
| DELETE | `/api/admin/videos/:id` | Delete |

**Business limits (enforced server + admin UI):**

- Max **4** PDF articles
- Max **1 MB** per PDF

---

## 7. How the frontend talks to the API

```js
// src/api/config.js
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

| Environment | API base |
|-------------|----------|
| **Netlify production** | `/api` (same origin) |
| **Local dev** | `/api` → Vite proxy → `http://localhost:3001` |
| **Split deploy** | Set `VITE_API_URL=https://api.example.com/api` at build time |

---

## 8. Current hosting — Netlify (all-in-one)

Everything runs on **one Netlify site**. No separate backend server.

### Build & deploy

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |
| Node version | 20 |

### Routing (`netlify.toml`)

1. `/api/*` → `/.netlify/functions/api` (Express API)
2. SPA routes (`/articles`, `/videos`, `/admindhanz`, etc.) → `/index.html`
3. Catch-all `/*` → `/index.html`

### Netlify environment variables (required)

| Variable | Purpose |
|----------|---------|
| `SANITY_PROJECT_ID` | `6992crjl` |
| `SANITY_DATASET` | `production` |
| `SANITY_WRITE_TOKEN` | Sanity Editor token (`sk...`) |
| `CMS_PASSWORD` | Admin panel password |

**Do not set `VITE_API_URL` on Netlify** — API is same-origin.

### Function config

- Timeout: 26 seconds
- Bundler: esbuild
- Includes `server/**` in function bundle
- Special handling for base64 bodies and JSON parsing (see `netlify/functions/api.js`, `server/jsonBody.js`)

### Verify after deploy

- `GET /api/health` → `{ ok: true, hasSanityToken: true, ... }`
- Home page market ticker loads
- `/admindhanz` login + article/video upload works

---

## 9. Local development

```bash
npm install
cp .env.example .env   # fill SANITY_WRITE_TOKEN, CMS_PASSWORD
npm run dev            # Vite :5173 + Express :3001
```

Alternative closer to production:

```bash
npm run dev:netlify    # Netlify CLI emulates functions + hosting
```

---

## 10. Sanity.io (CMS backend)

- **Project ID:** `6992crjl`
- **Dataset:** `production`
- **Stores:** article metadata, video metadata, PDF files as Sanity assets
- **Studio:** optional in `/sanity` — can run `npm run dev:studio` or deploy studio to sanity.io
- **Token:** Editor/write token only on server (never in frontend bundle)

---

## 11. What must any host support?

To host this project **fully** (same as current Netlify setup):

1. **Static hosting** for Vite `dist/` output
2. **SPA fallback** (rewrite to `index.html`)
3. **Node serverless or server** running Express `server/app.js` at `/api/*`
4. **Environment variables** for Sanity + CMS password
5. **Multipart uploads** for PDF (≤ 1 MB)
6. **Outbound HTTPS** to Sanity API and Yahoo Finance

---

## 12. Alternative hosting options (discussion points)

### A. Stay on Netlify (current — recommended)

- Already configured (`netlify.toml`, function wrapper, redirects)
- Same-origin `/api` — simplest
- Free tier sufficient for low traffic

### B. Firebase

| Component | Firebase option |
|-----------|-----------------|
| React SPA | **Firebase Hosting** (`dist/`) |
| Express API | **Cloud Functions** (need new wrapper, similar to Netlify) |
| Sanity | Unchanged (external) |

**Effort:** Medium — must recreate function entry, `firebase.json` rewrites, env config. PDF upload + cold starts need testing.

### C. Vercel

| Component | Option |
|-----------|--------|
| React SPA | Vercel static |
| Express API | Vercel serverless (`api/` routes or adapter) |

**Effort:** Medium — similar to Netlify migration.

### D. Split hosting

| Component | Host |
|-----------|------|
| Frontend | Netlify / Firebase Hosting / Vercel / Cloudflare Pages |
| API | Render / Railway / Fly.io (`npm start` → `server/index.js`) |

Set `VITE_API_URL` on frontend build to point to API URL. Enable CORS on API (`server/app.js` already uses `cors({ origin: true })`).

### E. Single VPS / traditional server

Run `npm run build` + `npm start` — `server/index.js` serves both `dist/` and API on one port.

---

## 13. Known production quirks (already solved)

- **SPA refresh 404** — fixed with `_redirects` + `netlify.toml`
- **JSON body empty on Netlify** for video POST — fixed in `server/jsonBody.js`
- **YouTube `/live/` URLs** — supported in `extractYouTubeId`
- **Lambda env loading** — `loadEnv.js` skips `.env` when `AWS_LAMBDA_FUNCTION_NAME` is set

---

## 14. Security notes

- Never commit `.env` or Sanity write token
- `CMS_PASSWORD` is server-side only (checked via `x-cms-password` header)
- Admin route is obscured (`/admindhanz`) but not secret — use a strong password
- Frontend has no Firebase or Sanity write credentials

---

## 15. npm scripts reference

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local Vite + Express |
| `npm run build` | Production frontend → `dist/` |
| `npm start` | Express serves API + `dist/` (single-server deploy) |
| `npm run dev:netlify` | Local Netlify emulation |
| `npm run dev:studio` | Sanity Studio locally |

---

## 16. Questions to discuss with ChatGPT

1. Is **Firebase Hosting + Cloud Functions** a good fit for this Express + multer + Sanity setup?
2. Cost comparison: Netlify vs Firebase vs Vercel vs Render for ~low–medium traffic?
3. Should we split frontend/API for easier scaling or keep all-in-one?
4. Custom domain + SSL on chosen platform?
5. Cold start impact on market ticker and admin uploads?
6. Migration checklist if moving off Netlify?

---

*Last updated: reflects codebase as deployed on Netlify with Sanity CMS. Admin path: `/admindhanz`. Brand colors: green `#61a842`, blue `#0A599B`.*
