---
name: platform-component
description: Build a Questlog UI component that looks native on each platform, as a Component.tsx (iOS) + Component.android.tsx pair behind one Props interface. Use for any component whose visuals differ between iOS (HIG, Liquid Glass) and Android (Material 3 Expressive).
argument-hint: "<ComponentName> [what it does]"
---

# Platform component

Metro resolves `Component.android.tsx` on Android and `Component.tsx` everywhere else. Screens import `@/components/.../Component` and never branch on `Platform.OS`. `src/components/glass/GlassSurface.tsx` and `GlassSurface.android.tsx` are the reference pair.

## 1. Check the APIs before writing code

Expo SDK 58 APIs differ from older docs and from memory.
- Fetch the versioned page for every Expo module you touch: `https://docs.expo.dev/versions/v58.0.0/sdk/<module>/`. For anything else, start from https://docs.expo.dev/llms.txt.
- Read the installed types in `node_modules/<pkg>/build/*.d.ts` for exact prop names.

## 2. Native code check

The app runs as a development build, so any library works, but anything with native code needs a rebuild (`npx expo run:ios`, and a new EAS Android build). Prefer what's already installed. If a new native dependency is needed, tell the user it requires a rebuild before adding it. Install with `npx expo install <pkg>`, never `npm install`.

## 3. Write the pair

- Same exported name and identical `Props` interface in both files. Keep an iOS-only or Android-only prop in both interfaces. The other platform just doesn't destructure it.
- iOS: HIG-native. Liquid Glass through `GlassSurface`, SF Symbols through `expo-symbols`, system materials.
- Android: Material 3 Expressive. Material Symbols through `expo-symbols` (`name={{ ios, android }}`), or filled Material Icons from `@expo/vector-icons/MaterialIcons` where a filled glyph is needed. Glass only on floating chrome.
- Anything blurred on Android has to sit inside `GlassBackdrop`, with the `GlassSurface` outside it, both under `GlassProvider`.
- Colours from `useTheme().color`, everything else from `@/theme/tokens`. Add tokens instead of inlining values.
- Arrow functions, named `Props`, `@/` imports, `StyleSheet.create`, no comments.
- Any motion follows the Motion rules in CLAUDE.md: transform and opacity only, UI-thread springs from `motion.springs`, interruptible, and no jumps under the finger.
- If the visuals truly don't differ, write a single file. Don't make a pair for nothing.

## 4. Verify

Run `npm run typecheck`, `npx expo lint`, and `npx expo export --platform ios --platform android --output-dir "$(mktemp -d)"` so both platform files get bundled. Tell the user which platform-specific behaviour still needs checking on a device, including any animation, which they should judge in `--no-dev --minify` mode.
