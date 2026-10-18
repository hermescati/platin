# Questlog

One log of every game you play, on every platform, filled in for you and rated your way.

## Setup

```sh
npm install
npm run android   # builds and installs the development build on a connected device or emulator
npx expo start    # dev server for an installed development build
```

Requires Android Studio (SDK + an emulator or a USB-debugging device). iOS builds need Xcode and are deferred.

## Scripts

| Script | Does |
| --- | --- |
| `npm run android` / `npm run ios` | Build and run a development build |
| `npm start` | Start the Metro dev server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
