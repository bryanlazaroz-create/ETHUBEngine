# Primate Protocol: Containment Sweep

Primate Protocol is a browser-based stealth capture game built with Phaser 3 and a pure JavaScript logic layer. Game progress and profiles are stored in Convex.

## Requirements

- Node.js 18+
- A Convex deployment (see `.env.example`)

## Setup

```bash
npm install
```

Create a `.env` file with your Convex URL:

```
VITE_CONVEX_URL=https://astute-starfish-225.convex.cloud
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Tests

```bash
npm test
```

## Lint

```bash
npm run lint
```

## Project Layout

- `index.html`: Game entry point with the canvas.
- `src/game/engine`: Pure logic layer (no Phaser or DOM dependencies).
- `src/game/client`: Phaser scenes and browser glue.
- `convex`: Convex schema and functions for profiles and saves.
