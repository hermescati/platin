import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import type { TabConfig } from '@/components/tab-bar/tabs';
import { fontSize, layout, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  tab: TabConfig;
  focused: boolean;
  showLabel?: boolean;
}

export const TabBarItem = ({ tab, focused, showLabel = true }: Props) => {
  const { color } = useTheme();
  const tint = focused ? color.accent : color.textSecondary;

  return (
    <View style={styles.item}>
      <SymbolView name={{ android: tab.icon }} size={layout.tabIconSize} tintColor={tint} />
      {showLabel && <Text style={[styles.label, { color: tint }]}>{tab.label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
