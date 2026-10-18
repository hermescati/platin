---
name: new-screen
description: Scaffold a Questlog screen, either a new tab in the floating tab bar or a screen pushed inside an existing tab's stack. Use whenever adding a route under src/app/.
argument-hint: "<tab|push> <name> [parent tab]"
---

# New screen

Routes live in `src/app/(tabs)/`. Each tab is a folder with its own `Stack` (`_layout.tsx`) and an `index.tsx`. Pushed screens are extra files in that tab's folder.

## 1. Decide the kind

- **Pushed screen** (detail, settings, editor): add `src/app/(tabs)/<tab>/<name>.tsx`, or `[id].tsx` for a dynamic route. Do not touch the tab bar.
- **New tab**: only when it is a top-level destination. The pill fits three primary tabs comfortably. Push back before adding a fourth, and suggest making it a pushed screen instead.

## 2. Write the files

Pushed screen, modelled on `src/app/(tabs)/library/index.tsx`:

```tsx
import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';

const GameDetailScreen = () => (
  <>
    <Stack.Screen options={{ title: 'Game' }} />
    <EmptyState title="..." description="..." />
  </>
);

export default GameDetailScreen;
```

Dynamic params come from `useLocalSearchParams` in `expo-router`. Navigate with `Link` or `router` and typed `href`s, e.g. `/library/123`. Groups like `(tabs)` don't appear in the URL.

New tab:
1. Copy `src/app/(tabs)/library/_layout.tsx` (large transparent header stack) into `src/app/(tabs)/<name>/_layout.tsx`, and add an `index.tsx`.
2. Add an entry to `primaryTabs` in `src/components/tab-bar/tabs.ts` with `name`, `href`, `label` and `icon`. `icon` takes `ios` and `iosSelected` (SF Symbols) and `android` (a Material Symbols name). Check the Android name exists: `grep '"<name>"' node_modules/expo-symbols/build/android/symbols.json`. The hidden `TabList` in `src/app/(tabs)/_layout.tsx` reads `allTabs`, so nothing else needs editing.

## 3. Rules every screen follows

- Scrollable content uses `contentInsetAdjustmentBehavior="automatic"` and bottom padding from `useTabBarInset()` (`@/components/tab-bar/useTabBarInset`), so the floating bar never covers the last row. `EmptyState` already does this.
- Colours from `useTheme().color`, and spacing, radii and type from `@/theme/tokens`. No raw values. If a value is missing, add a token.
- No `Platform.OS` branching for visuals. If a part looks different per platform, build it with the `platform-component` skill.
- Arrow functions, a named `Props` interface, `@/` imports, default-exported screen component, no comments.
- Only Expo Go bundled modules.

## 4. Verify

Run `npm run typecheck` and `npx expo lint`, then bundle with `npx expo export --platform ios --platform android --output-dir "$(mktemp -d)"`. Report anything that fails. Don't claim the screen works if a step failed.
