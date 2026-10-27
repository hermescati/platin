import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { motion, opacity } from '@/theme/tokens';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Pulse = ({ children, style }: Props) => {
  const reduceMotion = useReducedMotion();
  const level = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    level.set(withRepeat(withTiming(opacity.skeleton, { duration: motion.pulse }), -1, true));
    return () => cancelAnimation(level);
  }, [level, reduceMotion]);

  const animated = useAnimatedStyle(() => ({ opacity: level.value }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
};
