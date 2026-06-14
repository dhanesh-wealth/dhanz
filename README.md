# Dhanz Wealth

Official website for **Dhanz Wealth** — a premium wealth management firm. The site combines a marketing landing page, CMS-managed articles and videos, a live Indian market ticker, and an admin panel for content updates without redeploying the frontend.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [npm Scripts](#npm-scripts)
- [Routes](#routes)
- [Content Management](#content-management)
- [CMS Admin Panel](#cms-admin-panel)
- [API Reference](#api-reference)
- [Live Market Ticker](#live-market-ticker)
- [Theming & Branding](#theming--branding)
- [Editing Static Content](#editing-static-content)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Features

### Public website
- **Home page** with hero image slider, about section, services overview, detailed service blocks, and contact CTA
- **Responsive navigation** with smooth scroll to page sections and client-side routing for `/articles` and `/videos`
- **Live market ticker** on the home page (NIFTY 50, SENSEX, Bank Nifty, Nifty IT, Nifty Auto, USD/INR)
- **Articles** — list and read CMS-uploaded PDF articles in an in-browser viewer
- **Predefined article** at `/article2` (static content from JSON)
- **Videos** — YouTube gallery with embedded player, managed via CMS
- **WhatsApp** floating button with pre-filled greeting message
- **App Store / Play Store** badges in footer and contact section
- **Dark / light mode** via system `prefers-color-scheme`, including theme-aware logos

### CMS (Content Management System)
- Password-protected admin at `/dhanzlsadmin`
- **Articles tab** — upload PDFs, set title/description, publish/unpublish, delete
- **Videos tab** — add YouTube URLs, set title/description, publish/unpublish, delete
- **Sanity.io** (project `6992crjl`) for articles, videos, and PDF assets
- Optional **Sanity Studio** for direct content editing

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router 7 |
| Animation | Framer Motion |
| PDF viewing | react-pdf (pdfjs-dist v5) with iframe fallback |
| Backend | Express 5 + `@sanity/client` |
| CMS | Sanity.io (project `6992crjl`, dataset `production`) |
| Content (static) | `src/data/websiteData.json` |
| Content (dynamic) | Sanity `article` + `video` documents |
| Market data | Yahoo Finance Chart API (v8), proxied by Express |
| Fonts | Cormorant Garamond, DM Sans (Google Fonts) |
| Image optimization | Sharp (`npm run optimize:heroes`) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (React SPA)                                        │
│  • Home, Articles, Videos, Admin UI                         │
│  • Fetches /api/*                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
    Dev: Vite proxy         │    Prod: Express serves API + dist
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Express API (server/index.js)                              │
│  • Articles CRUD + PDF upload to Sanity assets              │
│  • Videos CRUD in Sanity                                    │
│  • Market rates (Yahoo Finance, 30s cache)                  │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
              Sanity.io (6992crjl / production)
              article + video documents, PDF files
```

**Deploy guides:**
- **[deploy.md](./deploy.md)** — Netlify (website) + Render (API)
- **[do.md](./do.md)** — Sanity setup & alternative hosts

---

## Project Structure

```
danz-wealth/
├── do.md                      # Hosting & Sanity setup guide (start here)
├── index.html                 # HTML shell, meta tags, fonts
├── vite.config.js             # Vite + /api proxy to localhost:3001
├── package.json
├── sanity/                    # Sanity Studio + schemas
│   ├── sanity.config.js       # Project 6992crjl
│   └── schemaTypes/           # article, video
├── scripts/
│   └── optimize-hero-images.mjs
├── server/
│   ├── index.js               # Express API (Sanity + market rates)
│   └── sanity.js              # Sanity client helpers
├── src/
│   ├── main.jsx
│   ├── App.jsx                # Route definitions
│   ├── index.css              # Global styles, CSS variables, dark mode
│   ├── api/
│   │   ├── config.js          # API base URL
│   │   ├── articles.js        # Article API client
│   │   └── videos.js          # Video + market rates API client
│   ├── assets/images/         # Logos, heroes, service images
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Logo.jsx           # Light/dark logo switcher
│   │   ├── HeroSlider.jsx
│   │   ├── MarketTicker.jsx   # Live scrolling rates
│   │   ├── About.jsx
│   │   ├── ServicesGrid.jsx   # "What We Offer" (service ids 1–6)
│   │   ├── ServiceDetails.jsx # "We Deal With" (service ids 7–13)
│   │   ├── ContactCTA.jsx
│   │   ├── FloatingButtons.jsx
│   │   ├── PdfViewer.jsx
│   │   └── Layout.jsx
│   ├── data/
│   │   └── websiteData.json   # All static site copy & config
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Articles.jsx
│   │   ├── ArticleView.jsx
│   │   ├── Article2.jsx       # Static predefined article
│   │   ├── Videos.jsx
│   │   └── Admin.jsx          # CMS admin UI
│   └── utils/
│       ├── getImage.js        # Image resolver (WebP preference)
│       ├── useColorScheme.js
│       ├── youtube.js         # YouTube ID / embed helpers
│       ├── whatsapp.js
│       └── animations.js
└── dist/                      # Production build output (after npm run build)
```

---

## Getting Started

### Prerequisites
- **Node.js** 20+
- **npm**
- **Sanity.io** project `6992crjl` with `production` dataset
- **Sanity API token** (Editor) — see **[do.md](./do.md)**

### Install

```bash
npm install
cd sanity && npm install && cd ..
copy .env.example .env
```

Set `SANITY_WRITE_TOKEN` and `CMS_PASSWORD` in `.env`.

### Development

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Website (dev) | http://localhost:5173 |
| API server | http://localhost:3001 |
| CMS admin | http://localhost:5173/dhanzlsadmin |
| Sanity Studio | http://localhost:3333 (`npm run dev:studio`) |

> **Note:** Running only `npm run dev:client` (Vite alone) will break articles, videos, and the market ticker.

### Deploy

See **[deploy.md](./deploy.md)** for Netlify + Render, or **[do.md](./do.md)** for other options.

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite (5173) + Express API (3001) |
| `npm run dev:client` | Vite only |
| `npm run dev:server` | Express API only |
| `npm run dev:studio` | Sanity Studio (3333) |
| `npm run build` | Build React app to `dist/` |
| `npm start` | Production server (API + `dist/`) |
| `npm run deploy:studio` | Deploy hosted Sanity Studio |
| `npm run preview` | Preview Vite build (no API) |
| `npm run lint` | ESLint |
| `npm run optimize:heroes` | Compress hero images and generate WebP variants |

---

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Landing page with market ticker |
| `/articles` | Articles | List of published CMS articles + predefined articles |
| `/articles/:slug` | ArticleView | Single article with PDF viewer |
| `/article2` | Article2 | Static article (content in `websiteData.json`) |
| `/videos` | Videos | YouTube video gallery |
| `/dhanzlsadmin` | Admin | CMS login and content management |

Home page sections use hash anchors: `#home`, `#about`, `#what-we-offer`, `#services`, `#contact`.

---

## Content Management

The site uses **two content layers**:

### 1. Static content — `src/data/websiteData.json`
Edit this file for copy that rarely changes:
- Site name, tagline, navigation, footer links
- Hero slides and buttons
- About, services (13 entries), contact info
- WhatsApp number and greeting
- App Store / Play Store URLs
- Predefined article (`article2`)
- Logo filenames (`logo.png`, `logodark.png`)

After editing, rebuild or refresh dev server.

### 2. Dynamic content — CMS + Sanity.io
Managed through `/dhanzlsadmin` without redeploying:

| Content | Storage |
|---------|---------|
| Articles (PDF) | Sanity `article` documents + file assets |
| Videos (YouTube) | Sanity `video` documents |

---

## CMS Admin Panel

**URL:** `/dhanzlsadmin`  
**Default password (local only):** `dhanz2026` — set `CMS_PASSWORD` in `.env` / hosting env (see [do.md](./do.md))

### Articles
1. Sign in with the CMS password
2. Open the **Articles** tab
3. Enter title, optional description, select a PDF (max 50 MB)
4. Choose publish immediately or save as draft
5. Published articles appear on `/articles` and at `/articles/{slug}`

### Videos
1. Open the **Videos** tab
2. Enter title, optional description, and a YouTube URL  
   Supported formats: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/`, `youtube.com/shorts/`
3. Publish or save as draft
4. Published videos appear on `/videos` with embedded player

### Auth
Admin requests send the password in the `x-cms-password` HTTP header. The password is stored in `sessionStorage` for the browser session only.

---

## API Reference

Base path: `/api`  
Admin routes require header: `x-cms-password: <password>`

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/articles` | List published articles |
| `GET` | `/api/articles/:slug` | Single published article |
| `GET` | `/api/videos` | List published videos |
| `GET` | `/api/market-rates` | Live Indian market rates (cached 30s) |

### Admin (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/articles` | List all articles |
| `POST` | `/api/admin/articles` | Upload article (`multipart/form-data`: title, description, published, pdf) |
| `PATCH` | `/api/admin/articles/:id` | Update title, description, or published status |
| `DELETE` | `/api/admin/articles/:id` | Delete article and PDF file |
| `GET` | `/api/admin/videos` | List all videos |
| `POST` | `/api/admin/videos` | Create video (`application/json`: title, description, youtubeUrl, published) |
| `PATCH` | `/api/admin/videos/:id` | Update video fields or publish status |
| `DELETE` | `/api/admin/videos/:id` | Delete video |

PDF files are stored on **Sanity CDN** (`cdn.sanity.io`). Article `pdfUrl` is a direct Sanity asset URL.

---

## Live Market Ticker

Displayed at the top of the home page.

**Data flow:**
1. `MarketTicker` component polls `/api/market-rates` every 30 seconds
2. Express server fetches from **Yahoo Finance Chart API v8**:
   ```
   https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}?interval=1d&range=1d
   ```
3. Server caches results for 30 seconds

**Symbols:**

| Display name | Yahoo symbol |
|--------------|--------------|
| NIFTY 50 | `^NSEI` |
| SENSEX | `^BSESN` |
| BANK NIFTY | `^NSEBANK` |
| NIFTY IT | `^CNXIT` |
| NIFTY AUTO | `^CNXAUTO` |
| USD/INR | `INR=X` |

Rates are indicative (via Yahoo Finance), not official NSE/BSE feeds.

---

## Theming & Branding

- **Light mode logo:** `src/assets/images/logo.png`
- **Dark mode logo:** `src/assets/images/logodark.png`
- Theme follows system preference (`prefers-color-scheme`) via `Logo.jsx` and CSS variables in `src/index.css`
- Brand colors: navy/gold palette with green and blue accents from the Dhanz Wealth logo

### Images
Place assets in `src/assets/images/`. The `getImage()` helper prefers WebP variants when available (e.g. `hero1.webp` over `hero1.jpg`).

---

## Editing Static Content

### Services layout
- **What We Offer** (`ServicesGrid`): service IDs `1–6`
- **We Deal With** (`ServiceDetails`): service IDs `7–13`

### Contact & WhatsApp
Update `contact` in `websiteData.json`:
```json
{
  "phone": "+91 99469 24365",
  "email": "dhanesh@dhanzwealth.com",
  "whatsapp": "919946924365",
  "whatsappGreeting": "Hello! I am interested in Dhanz Wealth services..."
}
```

### Hero images
Run `npm run optimize:heroes` after adding or replacing hero JPGs to generate compressed WebP versions.

---

## Production Deployment

Deploy the Express server + built React app to **Render**, **Railway**, or a **VPS**:

```bash
npm run build
npm start
```

**Full step-by-step guide:** **[do.md](./do.md)**

### Before going live
- [ ] Sanity project `6992crjl` with `production` dataset
- [ ] `SANITY_WRITE_TOKEN` set on server (Editor permission)
- [ ] Strong `CMS_PASSWORD` set in hosting env
- [ ] Run `npx sanity schema deploy` in `sanity/` folder

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SANITY_PROJECT_ID` | `6992crjl` |
| `SANITY_DATASET` | `production` |
| `SANITY_WRITE_TOKEN` | Sanity API token (server only) |
| `CMS_PASSWORD` | Admin panel password |
| `PORT` | API server port (default `3001`) |
| `VITE_API_URL` | Override API base (split deploy only) |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Articles/videos not loading | Run `npm run dev`, not Vite alone |
| "SANITY_WRITE_TOKEN not configured" | Add token to `.env` |
| Market ticker empty | Check API server logs |
| PDF viewer fails | Confirm Sanity asset URL on article |
| CMS login fails | Match `CMS_PASSWORD` in `.env` |
| Images not updating | Clear cache; confirm file in `src/assets/images/` |
| Hero loads slowly | Run `npm run optimize:heroes` |

See **[do.md](./do.md)** for full troubleshooting.

---

## License

Private — © 2026 Dhanz Wealth. All rights reserved.
