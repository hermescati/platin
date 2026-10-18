import type { SharedValue } from 'react-native-reanimated';

export interface GlassTransform {
  scaleX: SharedValue<number>;
  scaleY: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
}
