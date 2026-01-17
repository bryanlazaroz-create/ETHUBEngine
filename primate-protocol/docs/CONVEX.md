# Convex data storage

This game stores profiles, saves, and scores in Convex using the official
JavaScript client. The deployment URL is provided via environment variables
and is not hard-coded in game code.

## Deployment endpoints

- API: https://astute-starfish-225.convex.cloud
- Dashboard/site: https://astute-starfish-225.convex.site

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_CONVEX_URL` to the Convex deployment URL.
3. Run `npm run convex:dev` in a separate terminal to sync functions.
