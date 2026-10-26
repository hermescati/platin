import { GlassView } from 'expo-lucent';
import { useEffect, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon, type IconName } from '@/components/icon/Icon';
import { layout, motion, opacity, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  icon: IconName;
}

const { illustration } = layout;
const cardTop = (illustration.height - illustration.card.height) / 2 - space[4];
const centreLeft = (illustration.width - illustration.card.width) / 2;
const cards = [
  { left: centreLeft - illustration.card.width * 0.72, tilt: -illustration.cardTilt, order: 0 },
  { left: centreLeft + illustration.card.width * 0.72, tilt: illustration.cardTilt, order: 2 },
  { left: centreLeft, tilt: 0, order: 1 },
];

const useLoop = (value: SharedValue<number>, duration: number, delay: number, reduceMotion: boolean) => {
  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    value.set(withDelay(delay, withRepeat(withTiming(1, { duration }), -1, true)));
    return () => cancelAnimation(value);
  }, [value, duration, delay, reduceMotion]);
};

interface CardProps {
  left: number;
  tilt: number;
  order: number;
  accent: boolean;
  reduceMotion: boolean;
}

const Card = ({ left, tilt, order, accent, reduceMotion }: CardProps) => {
  const { color } = useTheme();
  const bob = useSharedValue(0);
  useLoop(bob, motion.bob.duration, order * motion.bob.delay, reduceMotion);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * motion.bob.distance }, { rotate: `${tilt}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        { left, backgroundColor: accent ? color.accent.tint : color.bg.surface, shadowColor: color.shadow.glass },
        style,
      ]}>
      <View style={[styles.line, styles.lineLong, { backgroundColor: color.line.strong }]} />
      <View style={[styles.line, styles.lineShort, { backgroundColor: color.line.track }]} />
    </Animated.View>
  );
};

export const EmptyIllustration = ({ icon }: Props) => {
  const { color } = useTheme();
  const reduceMotion = useReducedMotion();
  const glowId = `glow-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const sweep = useSharedValue(0);
  useLoop(sweep, motion.sweep.duration, 0, reduceMotion);
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (sweep.value * 2 - 1) * motion.sweep.distance }],
  }));

  return (
    <View style={styles.stage} aria-hidden>
      <Svg style={styles.glow}>
        <Defs>
          <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color.accent.fill} stopOpacity={opacity.glowStrong} />
            <Stop offset="0.55" stopColor={color.accent.fill} stopOpacity={opacity.glowFaint} />
            <Stop offset="1" stopColor={color.accent.fill} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${glowId})`} />
      </Svg>
      {cards.map((card) => (
        <Card key={card.order} {...card} accent={card.order === 1} reduceMotion={reduceMotion} />
      ))}
      <Animated.View style={[styles.circleWrap, sweepStyle]}>
        <GlassView style={styles.circle}>
          <Icon name={icon} size={28} weight="bold" tone="accent" />
        </GlassView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  stage: {
    width: illustration.width,
    height: illustration.height,
  },
  glow: {
    position: 'absolute',
    left: -illustration.glowSpread,
    right: -illustration.glowSpread,
    top: -illustration.glowSpread,
    bottom: -illustration.glowSpread,
  },
  card: {
    position: 'absolute',
    top: cardTop,
    width: illustration.card.width,
    height: illustration.card.height,
    borderRadius: radius.md,
    padding: space[8],
    gap: space[6],
    justifyContent: 'flex-end',
    shadowOffset: { width: 0, height: space[8] },
    shadowRadius: space[24],
    shadowOpacity: 1,
  },
  line: {
    height: space[6],
    borderRadius: radius.full,
  },
  lineLong: {
    width: '70%',
  },
  lineShort: {
    width: '45%',
  },
  circleWrap: {
    position: 'absolute',
    left: (illustration.width - illustration.circle) / 2,
    top: (illustration.height - illustration.circle) / 2,
  },
  circle: {
    width: illustration.circle,
    height: illustration.circle,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
