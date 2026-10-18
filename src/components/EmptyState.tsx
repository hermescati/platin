import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { useTabBarInset } from '@/components/tab-bar/useTabBarInset';
import { useTabBarScroll } from '@/components/tab-bar/useTabBarScroll';
import { fontSize, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: Props) => {
  const { color } = useTheme();
  const tabBarInset = useTabBarInset();
  const onScroll = useTabBarScroll();

  return (
    <Animated.ScrollView
      contentInsetAdjustmentBehavior="automatic"
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ backgroundColor: color.background }}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}>
      <Text style={[styles.title, { color: color.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: color.textSecondary }]}>{description}</Text>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
