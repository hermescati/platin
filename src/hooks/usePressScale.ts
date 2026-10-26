import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

export const usePressScale = (pressedScale: number = motion.scale.press) => {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return {
    style,
    onPressIn: () => {
      scale.set(withSpring(pressedScale, motion.springs.snappy));
    },
    onPressOut: () => {
      scale.set(withSpring(1, motion.springs.settle));
    },
  };
};
