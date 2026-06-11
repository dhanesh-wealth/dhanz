# Hosting Guide — Dhanz Wealth (Sanity.io)

Step-by-step instructions to set up and host the Dhanz Wealth website with **Sanity.io** as the CMS backend.

**Sanity project ID:** `6992crjl`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React website (Vite)                                       │
│  • Public pages + /dhanzlsadmin admin UI                      │
│  • Calls /api/* (articles, videos, market rates)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Express API (server/index.js)                              │
│  • Admin password auth                                      │
│  • PDF upload → Sanity assets                               │
│  • Market ticker → Yahoo Finance                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Sanity.io (project 6992crjl, dataset: production)          │
│  • article documents + PDF file assets                      │
│  • video documents (YouTube links)                          │
└─────────────────────────────────────────────────────────────┘
```

Optional: **Sanity Studio** (`sanity/` folder) for managing content at `sanity.io` or a hosted studio URL.

---

## Step 1 — Sanity project setup

Your project ID is already configured: **`6992crjl`**

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Open project **6992crjl**
3. Confirm a dataset named **`production`** exists (create it if missing)

---

## Step 2 — Create API token

The server needs a **write token** to upload articles and manage videos.

1. Sanity Manage → project **6992crjl** → **API** → **Tokens**
2. Click **Add API token**
3. Name: `dhanz-wealth-server`
4. Permissions: **Editor**
5. Copy the token (starts with `sk...`)

---

## Step 3 — Configure environment variables

In the project root, copy the example env file:

```bash
copy .env.example .env
```

Edit `.env`:

```env
SANITY_PROJECT_ID=6992crjl
SANITY_DATASET=production
SANITY_WRITE_TOKEN=sk_your_token_here
CMS_PASSWORD=your-secure-admin-password
PORT=3001
```

| Variable | Purpose |
|----------|---------|
| `SANITY_WRITE_TOKEN` | Server → Sanity (upload PDFs, CRUD) |
| `CMS_PASSWORD` | Login for `/dhanzlsadmin` on your website |

> Never commit `.env` or expose `SANITY_WRITE_TOKEN` in the frontend.

---

## Step 4 — Install dependencies

```bash
npm install
cd sanity
npm install
cd ..
```

---

## Step 5 — Deploy Sanity schemas

Push the article & video schemas to your Sanity project:

```bash
cd sanity
npx sanity schema deploy
cd ..
```

Or run Sanity Studio locally to verify schemas:

```bash
npm run dev:studio
```

Studio opens at http://localhost:3333

You can also deploy a hosted studio:

```bash
npm run deploy:studio
```

---

## Step 6 — Test locally

Start the website + API server:

```bash
npm run dev
```

| URL | What |
|-----|------|
| http://localhost:5173 | Website |
| http://localhost:5173/dhanzlsadmin | CMS admin (your password) |
| http://localhost:3001/api/articles | API (Sanity-backed) |
| http://localhost:3333 | Sanity Studio (if `npm run dev:studio`) |

### Verify checklist
- [ ] CMS login works at `/dhanzlsadmin`
- [ ] Upload a test PDF article
- [ ] Add a YouTube video
- [ ] Article appears on `/articles` and PDF opens
- [ ] Videos page plays embedded video
- [ ] Market ticker shows live rates on home page

---

## Step 7 — Host the website

The React app and Express API need to be deployed together (API handles admin + Sanity writes + market ticker).

### Option A — Render (recommended, simple)

1. Push code to **GitHub**
2. [render.com](https://render.com) → **New Web Service**
3. Connect your repo
4. Settings:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Environment variables:** add all from `.env`
5. Deploy

Render runs `server/index.js` which serves both the API and the built `dist/` folder.

### Option B — Railway

Same as Render:
- Build: `npm install && npm run build`
- Start: `npm start`
- Add env vars in Railway dashboard

### Option C — Vercel (split)

| Part | Deploy |
|------|--------|
| Frontend | Vercel — `npm run build`, output `dist/` |
| API | Vercel Serverless or separate Render service |

For split deploy, set `VITE_API_URL` to your API server URL and update `src/api/config.js` usage.

### Option D — VPS (DigitalOcean, etc.)

```bash
npm install
npm run build
CMS_PASSWORD=xxx SANITY_WRITE_TOKEN=sk... npm start
```

Use **PM2** or **systemd** to keep the server running. Put **Nginx** in front with SSL.

---

## Step 8 — Custom domain

1. Point your domain DNS to your host (Render/Railway/VPS)
2. Enable SSL (automatic on Render/Railway)
3. Your site: `https://www.yourdomain.com`
4. Admin: `https://www.yourdomain.com/dhanzlsadmin`

---

## Daily CMS usage

### Website admin (same as before)
1. Go to `https://your-site.com/dhanzlsadmin`
2. Enter your `CMS_PASSWORD`
3. **Articles** — upload PDF, publish/unpublish, delete
4. **Videos** — paste YouTube URL, publish/unpublish, delete

### Sanity Studio (optional)
1. Go to your deployed studio URL or run `npm run dev:studio`
2. Edit articles and videos directly in Sanity
3. Changes appear on the website immediately

---

## Environment variables (production)

Set these on your hosting platform:

| Variable | Required | Example |
|----------|----------|---------|
| `SANITY_PROJECT_ID` | Yes | `6992crjl` |
| `SANITY_DATASET` | Yes | `production` |
| `SANITY_WRITE_TOKEN` | Yes | `sk...` |
| `CMS_PASSWORD` | Yes | strong password |
| `PORT` | Auto | set by host (Render uses `10000`) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CMS login fails | Check `CMS_PASSWORD` in server env |
| "SANITY_WRITE_TOKEN is not configured" | Add token to `.env` / hosting env vars |
| Articles empty | Confirm dataset is `production` and content is published |
| PDF won't load | Check Sanity asset URL in article; token needs Editor permission |
| API 404 in dev | Run `npm run dev` (not `dev:client` alone) |
| Schema errors in Studio | Run `npx sanity schema deploy` in `sanity/` folder |
| CORS on PDF viewer | Sanity CDN allows cross-origin; check browser console |

### Test Sanity connection

```bash
curl http://localhost:3001/api/articles
```

Should return `[]` or a JSON array of articles.

### View Sanity content

[sanity.io/manage](https://www.sanity.io/manage) → project **6992crjl** → **Vision** (GROQ playground)

```groq
*[_type == "article"]{ title, "slug": slug.current, published }
```

---

## Security checklist

- [ ] Strong `CMS_PASSWORD` (not the default)
- [ ] `SANITY_WRITE_TOKEN` only on server, never in frontend
- [ ] `.env` not committed to git
- [ ] Sanity API token has **Editor** role (not Administrator unless needed)
- [ ] HTTPS enabled on production domain

---

## Quick command reference

```bash
npm install                  # Install website dependencies
cd sanity && npm install     # Install Studio dependencies
npm run dev                  # Website + API (local)
npm run dev:studio           # Sanity Studio (local)
npm run build                # Build React app
npm start                    # Production server (API + dist)
npm run deploy:studio        # Deploy hosted Sanity Studio
```

---

## What changed from Firebase

| Before (Firebase) | Now (Sanity) |
|-------------------|--------------|
| Firestore | Sanity documents |
| Firebase Storage | Sanity file assets |
| Cloud Functions | Express API (`server/`) |
| Firebase Hosting | Render / Railway / VPS |

All website features work the same — only the backend storage changed.
