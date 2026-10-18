@AGENTS.md

# Questlog

One log of every game you play, on every platform, filled in for you and rated your way. Product spec: https://claude.ai/code/artifact/652b9579-cc2a-44ae-b5eb-97aff5dfe55f

## Stack

- Expo SDK 58 with development builds (`expo-dev-client`), not Expo Go. iOS: `npx expo run:ios` builds locally into the simulator. Android: EAS development build (`eas build --profile development --platform android`) installed as an APK. Day to day: `npx expo start` and open the dev build; rebuild only when native code or config plugins change. `ios/` and `android/` are generated (CNG) and gitignored
- `expo-router`. Tabs: iOS uses system `NativeTabs` (`src/app/(tabs)/_layout.tsx`); Android uses headless tabs (`expo-router/ui`) with our floating glass bar (`_layout.android.tsx`, `src/components/tab-bar/`)
- Native UI: `@expo/ui` (SwiftUI / Jetpack Compose), `expo-glass-effect` on iOS, our `questlog-glass` Expo module on Android (`modules/questlog-glass`)
- Backend (planned): Supabase free tier (Postgres, Auth, Edge Functions + `pg_cron`, Vault); IGDB catalog and image CDN
- Data: local-first SQLite via `expo-sqlite` (`src/db/`), synced to Postgres later. Schema changes are new entries appended to `src/db/migrations.ts` (tracked by `PRAGMA user_version`), never edits to shipped ones. Screens read through `useLiveQuery` so writes refresh them automatically.

## UI rules

- Native per platform: iOS follows HIG with system Liquid Glass; Android follows Material 3 Expressive, with a native glass layer only on floating chrome (tab bar, scroll headers, overlay buttons).
- One component API, two implementations: `Component.tsx` + `Component.android.tsx` (Metro picks per platform). Screens never branch on `Platform.OS` for visuals.
- Colours, spacing, radii and type come from `src/theme/tokens.ts`; no raw values in components.
- Glass goes through `GlassSurface` (`src/components/glass/`): Liquid Glass via `expo-glass-effect` on iOS (`expo-blur` fallback), on Android `NativeGlassView` (refraction shader + blur from `modules/questlog-glass`, Android 13+ for refraction, 12 for blur) under tint + gradient rim + inset/drop `boxShadow`. Content seen through glass must sit inside `GlassBackdrop`, with the glass outside it; glass may be transformed freely (it maps the backdrop through its own matrix), so never counter-transform it. Tune glass in the `glass` tokens.
- Prefer Expo modules and existing libraries; native code (our own Expo module or a library) is allowed now that we use development builds, but it costs a rebuild, so say so when adding it. Native module changes need `npx expo run:android`; JS changes don't. NuvioMobile is GPL-3: study the technique, never copy its code or shaders.

## Motion

Every animation must hold the display's frame rate: no dropped frames, no hitches, no lag under the finger. Smoothness beats richness; cut an effect rather than ship it janky.

- Animate only `transform`, `opacity` and colours. Never animate `width`, `height`, margins, padding or anything else that triggers layout, and never resize a blur view per frame. Fake size changes with `scale` and `translate` on a fixed-size layout.
- Run animations and gesture handling on the UI thread: Reanimated worklets and Gesture Handler v3 hooks. No per-frame React state; cross to JS only with `scheduleOnRN` for discrete events (tab switch, haptic).
- Springs, not fixed-duration timing, for anything interactive. Configs live in `motion.springs` (`src/theme/tokens.ts`) as `duration` + `dampingRatio`: no bounce (`dampingRatio: 1`) for size and layout morphs, a slight settle (about 0.8) for things landing after a gesture.
- Direct manipulation never jumps: follow the finger by retargeting a short critically damped spring each frame (`motion.springs.track`), and keep velocity when the gesture ends.
- Interruptible: a new gesture or state change takes over from wherever the animation is, never restarts or snaps back. Don't re-trigger an animation that is already heading to the same target.
- Smooth derived values (stretch from velocity, for example) through a spring; never apply raw per-event values.
- Respect Reduce Motion (Reanimated springs follow the system setting by default).
- Judge smoothness with `npx expo start --go --no-dev --minify`, not the dev build.

## Code style

- TypeScript strict, arrow functions only, named `Props` interfaces, absolute `@/` imports.
- No comments in source beyond mechanical annotations.
- Run `npm run typecheck` and `npx expo lint` before declaring work done.
