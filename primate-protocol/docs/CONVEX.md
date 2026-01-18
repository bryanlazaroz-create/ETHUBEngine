# Convex data storage

This project currently stores gameplay saves locally (no database files are
checked into the repo). If you add persistent data storage, use the Convex
deployment endpoints below and keep database files out of the repository.

- API: https://astute-starfish-225.convex.cloud
- Dashboard/site: https://astute-starfish-225.convex.site

Recommended env values (example):
- `NEXT_PUBLIC_CONVEX_URL=https://astute-starfish-225.convex.cloud`
- `CONVEX_URL=https://astute-starfish-225.convex.cloud` (optional for server-side usage)
