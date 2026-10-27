import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { layout, motion, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Menu, type MenuItem } from '@/ui/Menu';

export interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  title: string;
  items: MenuItem[];
  selected?: string;
  bottom: number;
  anchor?: Anchor;
  lifted?: ReactNode;
  liftKind?: 'card' | 'tile';
  onSelect: (key: string) => void;
  onClose: () => void;
}

export const SearchOverlay = ({ title, items, selected, bottom, anchor, lifted, liftKind, onSelect, onClose }: Props) => {
  const { color } = useTheme();
  const { width, height } = useWindowDimensions();
  const menu = <Menu title={title} items={items} selected={selected} onSelect={onSelect} />;
  const below = anchor ? anchor.y + anchor.height + space.popover : 0;
  const fits = anchor ? below + layout.menuRow * (items.length + 1) < height - bottom : true;

  return (
    <Animated.View entering={FadeIn.duration(motion.fade)} exiting={FadeOut.duration(motion.fade)} style={StyleSheet.absoluteFill}>
      <Pressable
        style={[StyleSheet.absoluteFill, lifted ? { backgroundColor: color.overlay.scrim } : null]}
        onPress={onClose}
        accessibilityLabel="Close menu"
      />
      {lifted ? (
        <View pointerEvents="box-none" style={[styles.column, { bottom: bottom + space[24] }]}>
          <View
            pointerEvents="none"
            style={[
              liftKind === 'card' ? styles.liftedCard : styles.liftedTile,
              liftKind === 'card' && { width: width - space.gutter * 2 },
              { shadowColor: color.shadow.lifted },
            ]}>
            {lifted}
          </View>
          {menu}
        </View>
      ) : anchor ? (
        <View
          style={[
            styles.anchored,
            { right: width - (anchor.x + anchor.width) },
            fits ? { top: below } : { bottom: height - anchor.y + space.popover },
          ]}>
          {menu}
        </View>
      ) : (
        <View pointerEvents="box-none" style={[styles.column, { bottom: bottom + space[24] }]}>
          {menu}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  column: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: space[24],
  },
  liftedCard: {
    transform: [{ scale: motion.scale.liftCard }],
    shadowOffset: { width: 0, height: space[24] },
    shadowRadius: space[64],
    shadowOpacity: 1,
  },
  liftedTile: {
    transform: [{ scale: motion.scale.liftCover }],
    shadowOffset: { width: 0, height: space[24] },
    shadowRadius: space[64],
    shadowOpacity: 1,
  },
  anchored: {
    position: 'absolute',
  },
});
