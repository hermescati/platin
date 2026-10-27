import { Image } from 'expo-image';
import { GlassView } from 'expo-lucent';
import { useEffect, useId, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@/icons/Icon';
import { igdbLargeCoverUrl } from '@/lib/igdb';
import { carouselDim, cover, layout, motion, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { GlassButton } from '@/ui/GlassButton';
import { Text } from '@/ui/Text';

export interface CarouselItem {
  id: number;
  tag: string;
  meta: string;
  title: string;
  coverId: string | null;
  saved: boolean;
}

interface Props {
  items: CarouselItem[];
  onOpen: (id: number) => void;
  onSave: (id: number) => void;
}

interface CardProps {
  item: CarouselItem;
  index: number;
  count: number;
  front: boolean;
  progress: SharedValue<number>;
  cardWidth: number;
  onPress: () => void;
  onSave: () => void;
}

const { peek, slots, scaleStep, swing, dotSize, dotActive } = layout.carousel;
const dimSteps = carouselDim.map((_, index) => index);
const flickProjection = 0.2;

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const Scrim = () => {
  const gradientId = `scrim-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          {cover.scrimStops.map((stop) => (
            <Stop key={stop.offset} offset={stop.offset} stopColor={cover.scrim} stopOpacity={stop.opacity} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
    </Svg>
  );
};

const Card = ({ item, index, count, front, progress, cardWidth, onPress, onSave }: CardProps) => {
  const { color } = useTheme();

  const placement = useAnimatedStyle(() => {
    const current = progress.get();
    const offset = index - current;
    const distance = Math.abs(offset);
    const start = clamp(current - Math.floor(slots / 2), 0, Math.max(0, count - slots));
    const slot = index - start;
    const scale = 1 - scaleStep * Math.min(distance, slots - 1);
    const anchor = ((offset < 0 ? -1 : 1) * (1 - scale) * cardWidth) / 2;
    const swingOffset = distance < 1 ? offset * (1 - distance) * cardWidth * swing : 0;
    return {
      opacity: interpolate(slot, [-1, 0, slots - 1, slots], [0, 1, 1, 0], Extrapolation.CLAMP),
      zIndex: count * 10 - Math.round(distance * 10),
      transform: [{ translateX: peek * slot + anchor + swingOffset }, { scale }],
    };
  });

  const saveVisibility = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(index - progress.get()), [0, 1], [1, 0], Extrapolation.CLAMP),
  }));

  const dim = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(index - progress.get()), dimSteps, [...carouselDim], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={[styles.card, { width: cardWidth, backgroundColor: color.bg.raised }, placement]}
      accessibilityElementsHidden={!front}
      importantForAccessibility={front ? 'auto' : 'no-hide-descendants'}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.tag}`}>
        {item.coverId && (
          <Image source={igdbLargeCoverUrl(item.coverId)} style={StyleSheet.absoluteFill} contentFit="cover" />
        )}
        <Scrim />
        <View style={styles.caption}>
          <View style={styles.text}>
            <Text variant="captionEmphasized" numberOfLines={1} style={{ color: cover.textSecondary }}>
              <Text variant="captionEmphasized" style={[styles.tag, { color: cover.text }]}>{item.tag}</Text>
              {item.meta ? ` · ${item.meta}` : ''}
            </Text>
            <Text variant="gameTitle" numberOfLines={3} style={{ color: cover.text }}>{item.title}</Text>
          </View>
          <Animated.View style={saveVisibility} pointerEvents={front ? 'auto' : 'none'}>
            <GlassButton
              label={item.saved ? 'In your library' : 'Add to wishlist'}
              icon="bookmark"
              iconVariant={item.saved ? 'fill' : 'outline'}
              iconOnly
              onPress={onSave}
            />
          </Animated.View>
        </View>
      </Pressable>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color.bg.screen }, dim]} />
    </Animated.View>
  );
};

export const FeaturedCarousel = ({ items, onOpen, onSave }: Props) => {
  const { color } = useTheme();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const count = items.length;
  const cardWidth = width - space.gutter * 2 - peek * (slots - 1);
  const progress = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const dragging = useSharedValue(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!reduceMotion);
  const [held, setHeld] = useState(false);

  const goTo = (target: number) => {
    const next = clamp(target, 0, count - 1);
    progress.set(withSpring(next, motion.springs.morph));
    setIndex(next);
  };

  useEffect(() => {
    if (!playing || held || count < 2) {
      return;
    }
    const timer = setTimeout(() => {
      const next = (index + 1) % count;
      progress.set(withSpring(next, motion.springs.morph));
      setIndex(next);
    }, motion.autoplay);
    return () => clearTimeout(timer);
  }, [playing, held, index, count, progress]);

  const settle = (target: number) => {
    setIndex(target);
    setHeld(false);
  };

  const pan = usePanGesture({
    activeOffsetX: [-space[8], space[8]],
    failOffsetY: [-space[8], space[8]],
    onActivate: () => {
      cancelAnimation(progress);
      dragStart.set(progress.get());
      dragging.set(true);
      scheduleOnRN(setHeld, true);
    },
    onUpdate: (event) => {
      if (!dragging.get()) {
        return;
      }
      const raw = dragStart.get() - event.translationX / cardWidth;
      const over = raw < 0 ? raw : raw > count - 1 ? raw - (count - 1) : 0;
      progress.set(withSpring(raw - over + over / 3, motion.springs.track));
    },
    onDeactivate: (event) => {
      if (!dragging.get()) {
        return;
      }
      dragging.set(false);
      const velocity = -event.velocityX / cardWidth;
      const origin = Math.round(dragStart.get());
      const projected = Math.round(progress.get() + velocity * flickProjection);
      const target = clamp(clamp(projected, origin - 1, origin + 1), 0, count - 1);
      progress.set(withSpring(target, { ...motion.springs.settle, velocity }));
      scheduleOnRN(settle, target);
    },
  });

  if (count === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      <GestureDetector gesture={pan}>
        <View style={[styles.deck, { height: cardWidth / layout.coverAspectRatio }]}>
          {items.map((item, itemIndex) => (
            <Card
              key={item.id}
              item={item}
              index={itemIndex}
              count={count}
              front={itemIndex === index}
              progress={progress}
              cardWidth={cardWidth}
              onPress={() => (itemIndex === index ? onOpen(item.id) : goTo(itemIndex))}
              onSave={() => onSave(item.id)}
            />
          ))}
        </View>
      </GestureDetector>
      <View style={styles.controls}>
        <GlassView style={styles.pager}>
          <Pressable
            onPress={() => setPlaying((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause' : 'Play'}
            hitSlop={space[8]}>
            <Icon name={playing ? 'pause' : 'play'} variant="fill" size={16} />
          </Pressable>
          <View style={styles.dots}>
            {items.map((item, itemIndex) => (
              <View
                key={item.id}
                style={[
                  styles.dot,
                  itemIndex === index
                    ? { width: dotActive, backgroundColor: color.text.primary }
                    : { backgroundColor: color.line.strong },
                ]}
              />
            ))}
          </View>
        </GlassView>
        <View style={styles.arrows}>
          <GlassButton label="Previous" icon="back" iconOnly disabled={index === 0} onPress={() => goTo(index - 1)} />
          <GlassButton
            label="Next"
            icon="chevronRight"
            iconOnly
            disabled={index === count - 1}
            onPress={() => goTo(index + 1)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: space[16],
  },
  deck: {
    marginHorizontal: space.gutter,
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    aspectRatio: layout.coverAspectRatio,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  caption: {
    position: 'absolute',
    left: space[16],
    right: space[16],
    bottom: space[16],
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space[16],
  },
  text: {
    flex: 1,
    gap: space[6],
  },
  tag: {
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.gutter,
  },
  pager: {
    height: layout.glassButton.medium,
    paddingHorizontal: space[16],
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[16],
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[6],
  },
  dot: {
    width: dotSize,
    height: dotSize,
    borderRadius: radius.full,
  },
  arrows: {
    flexDirection: 'row',
    gap: space[8],
  },
});
