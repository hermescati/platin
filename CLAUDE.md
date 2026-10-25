@AGENTS.md

# Platin

One log of every game you play, on every platform, filled in for you and rated your way. Design, product spec and data model: https://claude.ai/artifact/6TDRCHFoAtAC7tyf8u3d4o (spec and data model on the Docs page)

## Stack

- Expo SDK 58 with development builds (`expo-dev-client`), not Expo Go. iOS: `npx expo run:ios` builds locally into the simulator. Android: EAS development build (`eas build --profile development --platform android`) installed as an APK. Day to day: `npx expo start` and open the dev build; rebuild only when native code or config plugins change. `ios/` and `android/` are generated (CNG) and gitignored
- `expo-router`. Tabs: `NativeTabs` and `SearchBar` from Lucent (`src/app/(tabs)/_layout.tsx`): the system tab bar on iOS, Lucent's floating glass bar on Android
- Native UI: `@expo/ui` (SwiftUI / Jetpack Compose) and Lucent (`expo-lucent`, our own library at `~/Desktop/Projects/lucent`, linked locally as `file:../lucent` until it's published). Lucent copies Expo's APIs and gives Android the iOS look; `metro.config.js` makes Lucent's source use Platin's copies of shared packages, and after changing Lucent's exported types run `CI=1 npm run build` there
- Backend (planned): Supabase free tier (Postgres, Auth, Edge Functions + `pg_cron`, Vault); IGDB catalog and image CDN
- Data: local-first SQLite via `expo-sqlite` (`src/db/`), synced to Postgres later. Schema changes are new entries appended to `src/db/migrations.ts` (tracked by `PRAGMA user_version`), never edits to shipped ones. Screens read through `useLiveQuery` so writes refresh them automatically.

## UI rules

- Native per platform: iOS follows HIG with system Liquid Glass. Android follows Material 3 Expressive, except where a Lucent component exists: those use Lucent's iOS styling on both platforms.
- One component API, two implementations: `Component.tsx` + `Component.android.tsx` (Metro picks per platform). Screens never branch on `Platform.OS` for visuals.
- Colours, spacing, radii and type come from `src/theme/tokens.ts`; no raw values in components.
- Glass and the tab bar come from Lucent: `GlassView` / `GlassContainer` (same API as `expo-glass-effect`), `NativeTabs`, `SearchBar`, and `useTabBarScroll` / `useTabBarInset` / `TabScrollMarker` for tab scroll views. Platin's colours for it live in `src/theme/lucent.ts` (passed to `LucentProvider`). Improve glass, tabs and search in the Lucent repo, not in Platin.
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
