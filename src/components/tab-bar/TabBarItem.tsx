import { useTabTrigger } from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { TabConfig } from '@/components/tab-bar/tabs';
import { fontSize, layout, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  tab: TabConfig;
  showLabel?: boolean;
}

export const TabBarItem = ({ tab, showLabel = true }: Props) => {
  const { color } = useTheme();
  const { triggerProps } = useTabTrigger({ name: tab.name });
  const { isFocused, onPress, onLongPress } = triggerProps;
  const tint = isFocused ? color.accent : color.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isFocused }}
      style={[styles.item, isFocused && { backgroundColor: color.accentSoft }]}>
      <SymbolView
        name={{ ios: isFocused ? tab.icon.iosSelected : tab.icon.ios, android: tab.icon.android }}
        size={layout.tabIconSize}
        tintColor={tint}
      />
      {showLabel && <Text style={[styles.label, { color: tint }]}>{tab.label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
