import { StyleSheet, View } from 'react-native';

import { space } from '@/theme/tokens';
import { GlassButton } from '@/ui/GlassButton';
import { Text } from '@/ui/Text';

export const SearchHeader = () => (
  <View style={styles.header}>
    <Text variant="largeTitle" accessibilityRole="header" style={styles.title}>
      Search
    </Text>
    <GlassButton label="Filters" icon="filter" iconOnly />
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[8],
    marginBottom: -space[8],
  },
  title: {
    flex: 1,
  },
});
