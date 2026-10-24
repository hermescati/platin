# platin-glass

Expo's `GlassView` / `GlassContainer` API with real Liquid Glass on Android.

- iOS: re-exports `expo-glass-effect` (Apple's native glass).
- Android: our AGSL shader (refraction on Android 13+, blur on 12, translucent fill below).

```tsx
import { GlassBackdrop, GlassContainer, GlassView } from 'platin-glass';

<GlassBackdrop style={{ flex: 1 }}>
  <ScrollView>
    <GlassView isInteractive style={{ height: 48, borderRadius: 24 }}>
      <Text>Button</Text>
    </GlassView>
    <GlassView glassEffectStyle="clear" tintColor="#ff7a1a" style={{ borderRadius: 16 }} />
    <GlassContainer spacing={20} style={{ flexDirection: 'row', gap: 6 }}>
      <GlassView style={{ width: 56, height: 56, borderRadius: 28 }} />
      <GlassView style={{ width: 56, height: 56, borderRadius: 28 }} />
    </GlassContainer>
  </ScrollView>
</GlassBackdrop>
```

`GlassBackdrop` is the one Android-specific piece: wrap each screen's content once (a plain `View` on iOS). Glass inside it is drawn on a layer above the content, follows scrolling, transforms and opacity, is clipped by `overflow: hidden` ancestors, and shows glass beneath it one layer deep.

Supported props: `glassEffectStyle` (`regular`, `clear`, `none`, or `{ style, animate, animationDuration }`), `tintColor`, `isInteractive`, `colorScheme`, plus all `View` props. `GlassContainer` merges up to four direct-child glass shapes.
