import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';

interface Props {
  title: string;
  accessory?: ReactNode;
}

export const SectionHeader = ({ title, accessory }: Props) => (
  <View style={styles.header}>
    <Text variant="title2" accessibilityRole="header">{title}</Text>
    {accessory}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
