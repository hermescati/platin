import { useRef, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { layout, space } from '@/theme/tokens';
import { EdgeFade } from '@/ui/EdgeFade';
import { GlassButton } from '@/ui/GlassButton';
import { PullDown } from '@/ui/PullDown';
import {
  filterLabel,
  hasActiveFilters,
  isActive,
  quickFilters,
  type FilterKey,
  type FilterValues,
} from '@/views/search/utils/quickFilters';

interface Props {
  values: FilterValues;
  openKey: FilterKey | null;
  onOpen: (key: FilterKey, target: ComponentRef<typeof View>) => void;
  onClear: () => void;
}

export const QuickFilters = ({ values, openKey, onOpen, onClear }: Props) => {
  const refs = useRef<Partial<Record<FilterKey, ComponentRef<typeof View> | null>>>({});

  return (
    <View style={styles.bleed}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {hasActiveFilters(values) && <GlassButton label="Clear filters" icon="close" iconOnly onPress={onClear} />}
        {quickFilters.map((filter) => (
          <PullDown
            key={filter.key}
            ref={(view) => {
              refs.current[filter.key] = view;
            }}
            label={filterLabel(filter.key, values)}
            selected={isActive(filter.key, values)}
            open={openKey === filter.key}
            onPress={() => {
              const target = refs.current[filter.key];
              if (target) {
                onOpen(filter.key, target);
              }
            }}
          />
        ))}
      </ScrollView>
      <EdgeFade />
    </View>
  );
};

const styles = StyleSheet.create({
  bleed: {
    marginHorizontal: -space.gutter,
    marginTop: -space[8] - (layout.glassButton.medium - layout.pullDown) / 2,
    marginBottom: -(layout.glassButton.medium - layout.pullDown) / 2,
  },
  row: {
    minHeight: layout.glassButton.medium,
    paddingHorizontal: space.gutter,
    alignItems: 'center',
    gap: space[8],
  },
});
