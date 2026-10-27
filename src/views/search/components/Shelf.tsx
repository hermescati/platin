import { ScrollView, StyleSheet, View } from 'react-native';

import type { IconName } from '@/icons/Icon';
import type { CatalogGame } from '@/lib/catalog';
import { isAddon, typeBadge } from '@/shared/game/labels';
import { layout, space } from '@/theme/tokens';
import { EdgeFade } from '@/ui/EdgeFade';
import { SectionHeader } from '@/ui/SectionHeader';
import { ResultTile } from '@/views/search/components/ResultTile';

export interface ShelfItem {
  game: CatalogGame;
  subtitle: string;
}

interface Props {
  title: string;
  items: ShelfItem[];
  statusFor: (game: CatalogGame) => IconName | undefined;
  onOpen: (game: CatalogGame) => void;
  onLongPress: (game: CatalogGame) => void;
}

export const Shelf = ({ title, items, statusFor, onOpen, onLongPress }: Props) => (
  <View style={styles.section}>
    <SectionHeader title={title} />
    <View style={styles.bleed}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map(({ game, subtitle }) => (
          <ResultTile
            key={game.id}
            title={game.name}
            subtitle={subtitle}
            coverImageId={game.coverId}
            width={layout.shelfTile}
            badge={isAddon(game.type) ? typeBadge(game.type) : null}
            statusIcon={statusFor(game)}
            onPress={() => onOpen(game)}
            onLongPress={() => onLongPress(game)}
          />
        ))}
      </ScrollView>
      <EdgeFade />
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: space[16],
  },
  bleed: {
    marginHorizontal: -space.gutter,
  },
  row: {
    paddingHorizontal: space.gutter,
    gap: space[16],
  },
});
