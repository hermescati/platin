import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  children: ReactNode;
}

export const GlassBackdrop = ({ children }: Props) => <View style={styles.fill}>{children}</View>;

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
