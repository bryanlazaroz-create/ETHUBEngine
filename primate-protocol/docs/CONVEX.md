# Convex data storage

This project stores gameplay saves in Convex for signed-in users, with a local
backup fallback. Convex saves are stored in the `saves` table and accessed via
`saves.upsertSave` and `saves.getLatest`.

- API: https://astute-starfish-225.convex.cloud
- Dashboard/site: https://astute-starfish-225.convex.site

Recommended env values (example):
- `NEXT_PUBLIC_CONVEX_URL=https://astute-starfish-225.convex.cloud`
- `CONVEX_URL=https://astute-starfish-225.convex.cloud` (optional for server-side usage)

Clerk JWT configuration (Convex environment variables):
- `CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev`
