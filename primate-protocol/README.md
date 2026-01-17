Primate Protocol is a browser-first Babylon.js game with a pure JavaScript
gameplay engine layer and Convex-backed persistence.

## Getting Started

1. `npm install`
2. Set `VITE_CONVEX_URL` in `.env` (see `docs/CONVEX.md`).
3. `npm run dev`
4. Open `http://localhost:5173`

## Build

- `npm run build`
- `npm run preview`

## Tests

- `npm test`
- `npm run lint`

## Data storage (Convex)

All saves, profiles, and scores live in Convex. Client code reads the deployment
URL from `VITE_CONVEX_URL` and never hard-codes secrets. See `docs/CONVEX.md`
for setup details.
