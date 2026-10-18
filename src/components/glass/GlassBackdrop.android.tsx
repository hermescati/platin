import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { NativeGlassBackdrop } from '@/components/glass/NativeGlass';

interface Props {
  children: ReactNode;
}

export const GlassBackdrop = ({ children }: Props) => (
  <NativeGlassBackdrop style={styles.fill}>{children}</NativeGlassBackdrop>
);

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
