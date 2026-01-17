Primate Protocol is a Next.js + React Three Fiber prototype targeting web and
Android (via Capacitor).

## Getting Started

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## Android 12 APK

Capacitor is configured for Android builds with static export output (`out/`).
Follow the step-by-step guide in `docs/ANDROID_APK.md`.

## Data storage (Convex)

Gameplay saves are local-only; no DB files are committed. If you add persistent
data storage, use the Convex endpoints in `docs/CONVEX.md` and keep database
artifacts out of the repo.
