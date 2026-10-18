import { useSharedValue, withSpring } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

export const useGlassPress = () => {
  const press = useSharedValue(0);

  return {
    press,
    onPressIn: () => press.set(withSpring(1, motion.springs.lift)),
    onPressOut: () => press.set(withSpring(0, motion.springs.lift)),
  };
};
