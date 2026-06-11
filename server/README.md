# CMS API Server (Sanity.io)

Express API that connects to **Sanity.io** project `6992crjl`.

- **Articles & videos** — stored in Sanity (`production` dataset)
- **PDF files** — uploaded to Sanity as file assets
- **Market ticker** — Yahoo Finance proxy (cached 30s)
- **Admin auth** — `CMS_PASSWORD` + `x-cms-password` header

## Required environment variables

```bash
SANITY_PROJECT_ID=6992crjl
SANITY_DATASET=production
SANITY_WRITE_TOKEN=sk...   # Editor token from sanity.io/manage
CMS_PASSWORD=your-password
```

Copy `.env.example` to `.env` in the project root and fill in `SANITY_WRITE_TOKEN`.

See [do.md](../do.md) for full setup and deployment.
