---
name: platform-component
description: Build a Questlog UI component that looks native on each platform, as a Component.tsx (iOS) + Component.android.tsx pair behind one Props interface, using only modules bundled in Expo Go. Use for any component whose visuals differ between iOS (HIG, Liquid Glass) and Android (Material 3 Expressive).
argument-hint: "<ComponentName> [what it does]"
---

# Platform component

Metro resolves `Component.android.tsx` on Android and `Component.tsx` everywhere else. Screens import `@/components/.../Component` and never branch on `Platform.OS`. `src/components/glass/GlassSurface.tsx` and `GlassSurface.android.tsx` are the reference pair.

## 1. Check the APIs before writing code

Expo SDK 58 APIs differ from older docs and from memory.
- Fetch the versioned page for every Expo module you touch: `https://docs.expo.dev/versions/v58.0.0/sdk/<module>/`. For anything else, start from https://docs.expo.dev/llms.txt.
- Read the installed types in `node_modules/<pkg>/build/*.d.ts` for exact prop names.

## 2. Expo Go gate

The app must run in Expo Go. Every native module used must be bundled in Expo Go. The SDK page says so, and anything outside `expo-*` or the core React Native set usually isn't. If a library needs its own native code, stop and tell the user what it would cost: development builds instead of Expo Go. Don't add it yourself. Install with `npx expo install <pkg>`, never `npm install`.

## 3. Write the pair

- Same exported name and identical `Props` interface in both files. Keep an iOS-only or Android-only prop in both interfaces. The other platform just doesn't destructure it.
- iOS: HIG-native. Liquid Glass through `GlassSurface`, SF Symbols through `expo-symbols`, system materials.
- Android: Material 3 Expressive. Material Symbols through `expo-symbols` (`name={{ ios, android }}`), and glass only on floating chrome.
- Anything blurred on Android has to sit inside `GlassBackdrop`, with the `GlassSurface` outside it, both under `GlassProvider`.
- Colours from `useTheme().color`, everything else from `@/theme/tokens`. Add tokens instead of inlining values.
- Arrow functions, named `Props`, `@/` imports, `StyleSheet.create`, no comments.
- If the visuals truly don't differ, write a single file. Don't make a pair for nothing.

## 4. Verify

Run `npm run typecheck`, `npx expo lint`, and `npx expo export --platform ios --platform android --output-dir "$(mktemp -d)"` so both platform files get bundled. Tell the user which platform-specific behaviour still needs checking on a device.
