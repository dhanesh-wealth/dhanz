# Deploy Guide — Netlify (all-in-one)

Host the **entire Dhanz Wealth** site on **Netlify** — website, CMS API, market ticker, and Sanity integration. No Render or other backend required.

**PDF limits:** max **1 MB** per file, max **4 articles** at a time.

---

## Architecture

```
Visitors → your-site.netlify.app
              │
              ├─ /, /articles, /videos, /dhanzlsadmin  →  static React (dist/)
              │
              └─ /api/*  →  Netlify Function (Express API)
                                    │
                                    ▼
                           Sanity.io (6992crjl)
```

---

## Prerequisites

- [GitHub](https://github.com) account
- [Netlify](https://netlify.com) account (free)
- [Sanity](https://sanity.io/manage) project **6992crjl** with Editor API token
- Production CMS password

---

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dhanz-wealth.git
git push -u origin main
```

**Never commit `.env`** — secrets go in the Netlify dashboard only.

---

## Step 2 — Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. **Add new site** → **Import an existing project** → GitHub
3. Select your repo
4. Build settings (auto-detected from `netlify.toml`):

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |

5. **Environment variables** (Site configuration → Environment variables):

| Key | Value |
|-----|-------|
| `SANITY_PROJECT_ID` | `6992crjl` |
| `SANITY_DATASET` | `production` |
| `SANITY_WRITE_TOKEN` | Your Sanity Editor token (`sk...`) |
| `CMS_PASSWORD` | Your strong admin password |

> **Do not set `VITE_API_URL`** — the site uses same-origin `/api` on Netlify.

6. Click **Deploy site**
7. Wait ~2–3 minutes

---

## Step 3 — Verify

| Test | URL |
|------|-----|
| API health | `https://your-site.netlify.app/api/health` |
| Home + ticker | `https://your-site.netlify.app` |
| Admin | `https://your-site.netlify.app/dhanzlsadmin` |

Health check should return:

```json
{
  "ok": true,
  "sanityProject": "6992crjl",
  "hasSanityToken": true,
  "limits": { "maxPdfMb": 1, "maxArticles": 4 }
}
```

---

## Step 4 — Custom domain (optional)

1. Netlify → **Domain management** → **Add a domain**
2. Add DNS records at your registrar
3. SSL is automatic

---

## CMS usage

1. Go to `https://your-site.netlify.app/dhanzlsadmin`
2. Log in with your `CMS_PASSWORD`
3. **Articles** — upload PDF (max **1 MB**), up to **4 total**
4. **Videos** — add YouTube links (no limit)

Delete an old article before uploading if you already have 4.

---

## Sanity Studio (optional)

You can also manage content at Sanity Studio:

```bash
cd sanity
npm install
npx sanity login
npm run deploy
```

---

## Local development

```bash
# Standard dev (Vite + Express on :3001)
npm run dev

# Test Netlify Functions locally (closer to production)
npm run dev:netlify
```

Copy `.env.example` to `.env` and set `SANITY_WRITE_TOKEN` + `CMS_PASSWORD`.

---

## Redeploying

Netlify auto-deploys on every push to `main`. To redeploy manually: **Deploys** → **Trigger deploy**.

After changing environment variables, trigger a **new deploy** (not just retry).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Admin login fails | Check `CMS_PASSWORD` in Netlify env vars, redeploy |
| `hasSanityToken: false` | Add `SANITY_WRITE_TOKEN` in Netlify, redeploy |
| PDF upload fails | File must be ≤ 1 MB |
| "Maximum 4 PDF articles" | Delete an article before uploading |
| Market ticker empty | Wait a few seconds (function cold start), refresh |
| API 502/504 | Netlify function timeout — retry; Yahoo Finance may be slow |
| Works locally, not on Netlify | Confirm all 4 env vars set in Netlify dashboard |

---

## Alternative: Netlify + Render

If you need PDFs larger than 1 MB or more than 4 articles, use **Netlify for the site** + **Render for the API**. See `render.yaml` and set `VITE_API_URL` on Netlify to your Render API URL.

---

## Security checklist

- [ ] Strong `CMS_PASSWORD` (not `dhanz2026`)
- [ ] `SANITY_WRITE_TOKEN` only in Netlify env (never in frontend code)
- [ ] `.env` not committed to GitHub
- [ ] Revoke and rotate tokens if ever exposed
