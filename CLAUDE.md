@AGENTS.md

# Questlog

One log of every game you play, on every platform, filled in for you and rated your way. Product spec: https://claude.ai/code/artifact/652b9579-cc2a-44ae-b5eb-97aff5dfe55f

## Stack

- Expo SDK 58; must run in Expo Go (no custom native code). `expo-dev-client` stays installed for later development builds; start with `npx expo start --go`
- `expo-router` with headless tabs (`expo-router/ui`) and a custom floating tab bar
- Native UI: `@expo/ui` (SwiftUI / Jetpack Compose), `expo-glass-effect` on iOS, `expo-blur` on Android
- Backend (planned): Supabase free tier (Postgres, Auth, Edge Functions + `pg_cron`, Vault); IGDB catalog and image CDN
- Data: local-first SQLite via `expo-sqlite` (`src/db/`), synced to Postgres later. Schema changes are new entries appended to `src/db/migrations.ts` (tracked by `PRAGMA user_version`), never edits to shipped ones. Screens read through `useLiveQuery` so writes refresh them automatically. Dev builds seed sample games into an empty database (`src/db/seed.ts`)

## UI rules

- Native per platform: iOS follows HIG with system Liquid Glass; Android follows Material 3 Expressive, with a native glass layer only on floating chrome (tab bar, scroll headers, overlay buttons).
- One component API, two implementations: `Component.tsx` + `Component.android.tsx` (Metro picks per platform). Screens never branch on `Platform.OS` for visuals.
- Colours, spacing, radii and type come from `src/theme/tokens.ts`; no raw values in components.
- Glass goes through `GlassSurface` (`src/components/glass/`): Liquid Glass via `expo-glass-effect` on iOS (`expo-blur` fallback), `expo-blur` + tint + hairline border on Android. Blurred content must sit inside `GlassBackdrop`, with the surface outside it, under one `GlassProvider`.
- Only use modules bundled in Expo Go. A custom native module (e.g. Android refraction shaders) is a later, deliberate step that swaps `GlassSurface.android.tsx` only. NuvioMobile is GPL-3: study the technique, never copy its code or shaders.

## Code style

- TypeScript strict, arrow functions only, named `Props` interfaces, absolute `@/` imports.
- No comments in source beyond mechanical annotations.
- Run `npm run typecheck` and `npx expo lint` before declaring work done.
