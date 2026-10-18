@AGENTS.md

# Questlog

One log of every game you play, on every platform, filled in for you and rated your way. Product spec: https://claude.ai/code/artifact/652b9579-cc2a-44ae-b5eb-97aff5dfe55f

## Stack

- Expo SDK 58 with development builds (`expo-dev-client`), never Expo Go; `expo-router` with `NativeTabs`
- Native UI: `@expo/ui` (SwiftUI / Jetpack Compose), `expo-glass-effect` on iOS
- Backend (planned): Supabase free tier (Postgres, Auth, Edge Functions + `pg_cron`, Vault); IGDB catalog and image CDN
- Data (planned): local-first SQLite on device, synced to Postgres

## UI rules

- Native per platform: iOS follows HIG with system Liquid Glass; Android follows Material 3 Expressive, with a native glass layer only on floating chrome (tab bar, scroll headers, overlay buttons).
- One component API, two implementations: `Component.tsx` + `Component.android.tsx` (Metro picks per platform). Screens never branch on `Platform.OS` for visuals.
- Colours, spacing, radii and type come from `src/theme/tokens.ts`; no raw values in components.
- The Android glass layer is our own Expo native module (Kotlin/Compose). NuvioMobile is GPL-3: study the technique, never copy its code or shaders.

## Code style

- TypeScript strict, arrow functions only, named `Props` interfaces, absolute `@/` imports.
- No comments in source beyond mechanical annotations.
- Run `npm run typecheck` and `npx expo lint` before declaring work done.
