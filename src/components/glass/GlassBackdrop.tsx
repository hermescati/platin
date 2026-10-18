import { BlurTargetView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { useGlassTarget } from '@/components/glass/GlassProvider';

interface Props {
  children: ReactNode;
}

export const GlassBackdrop = ({ children }: Props) => {
  const target = useGlassTarget();

  return (
    <BlurTargetView ref={target ?? undefined} style={styles.fill}>
      {children}
    </BlurTargetView>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
