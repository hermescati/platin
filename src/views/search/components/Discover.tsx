import { StyleSheet, View } from 'react-native';

import type { Discover as DiscoverData } from '@/db/discover';
import type { LibraryGame } from '@/db/types';
import type { CatalogGame } from '@/lib/catalog';
import { statusIcons } from '@/shared/game/labels';
import { space } from '@/theme/tokens';
import { FeaturedCarousel } from '@/views/search/components/FeaturedCarousel';
import { Shelf } from '@/views/search/components/Shelf';
import { franchiseSubtitle, platformsFor, ratedSubtitle, similarSubtitle } from '@/views/search/utils/discoverText';

interface Props {
  discover: DiscoverData;
  entries: Map<number, LibraryGame>;
  onOpen: (game: CatalogGame) => void;
  onSave: (game: CatalogGame) => void;
  onLongPress: (game: CatalogGame) => void;
}

export const Discover = ({ discover, entries, onOpen, onSave, onLongPress }: Props) => {
  const { feed, beatenTitle, platformIds } = discover;
  const featured = new Map(feed.featured.map((card) => [card.game.id, card.game]));
  const statusFor = (game: CatalogGame) => {
    const entry = entries.get(game.id);
    return entry ? statusIcons[entry.status] : undefined;
  };
  const withGame = (id: number, action: (game: CatalogGame) => void) => {
    const game = featured.get(id);
    if (game) {
      action(game);
    }
  };
  const shelves = [
    beatenTitle && {
      title: `Because you beat ${beatenTitle}`,
      items: feed.similar.map((game) => ({ game, subtitle: similarSubtitle(game) })),
    },
    {
      title: 'New in franchises you play',
      items: feed.franchise.map((game) => ({ game, subtitle: franchiseSubtitle(game) })),
    },
    {
      title: 'Top rated this year',
      items: feed.topRated.map((game) => ({ game, subtitle: ratedSubtitle(game, platformIds) })),
    },
  ].filter((shelf) => !!shelf && shelf.items.length > 0) as { title: string; items: { game: CatalogGame; subtitle: string }[] }[];

  return (
    <View style={styles.sections}>
      <View style={styles.bleed}>
        <FeaturedCarousel
          items={feed.featured.map(({ tag, game }) => ({
            id: game.id,
            tag,
            meta: platformsFor(game, platformIds),
            title: game.name,
            coverId: game.coverId,
            saved: entries.has(game.id),
          }))}
          onOpen={(id) => withGame(id, onOpen)}
          onSave={(id) => withGame(id, onSave)}
        />
      </View>
      {shelves.map((shelf) => (
        <Shelf
          key={shelf.title}
          title={shelf.title}
          items={shelf.items}
          statusFor={statusFor}
          onOpen={onOpen}
          onLongPress={onLongPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sections: {
    gap: space[32],
  },
  bleed: {
    marginHorizontal: -space.gutter,
  },
});
