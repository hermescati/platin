import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTabBarInset, useTabBarScroll } from 'expo-lucent';

import { Text } from '@/components/ui/Text';
import { space } from '@/theme/tokens';
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
      style={{ backgroundColor: color.bg.screen }}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}>
      <Text variant="title3">{title}</Text>
      <Text variant="subhead" tone="secondary" style={styles.description}>{description}</Text>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[8],
    padding: space[32],
  },
  description: {
    textAlign: 'center',
  },
});
