import { ScrollView, StyleSheet, Text } from 'react-native';

import { fontSize, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: Props) => {
  const { color } = useTheme();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: color.background }}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: color.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: color.textSecondary }]}>{description}</Text>
    </ScrollView>
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
