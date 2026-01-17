# Android 12 APK (Capacitor)

## Prerequisites
- Node.js 20+
- Java 17 (ANDROID SDK requires it)
- Android Studio + SDK (set `ANDROID_HOME`)

## Build the web bundle
1. `npm install`
2. `npm run android:sync`

This runs `next build` (static export to `out/`) and syncs assets into the
Capacitor Android project.

## Build the APK
1. `cd android`
2. `./gradlew assembleDebug`

APK output:
`android/app/build/outputs/apk/debug/app-debug.apk`

## Create the zip (APK + LICENSE)
From the project root:
- `npm run apk:zip`

This produces `dist/PrimateProtocol-android12.zip` containing the APK and
the root `LICENSE` file.

## Run on device/emulator
- `npm run android:run` (debug build)
- Or `npm run android:open` and run from Android Studio.
