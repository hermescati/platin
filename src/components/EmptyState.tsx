import { TabScrollView } from 'expo-lucent';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: Props) => {
  const { color } = useTheme();

  return (
    <TabScrollView style={{ backgroundColor: color.bg.screen }} contentContainerStyle={styles.content}>
      <Text variant="title3">{title}</Text>
      <Text variant="subhead" tone="secondary" style={styles.description}>{description}</Text>
    </TabScrollView>
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
