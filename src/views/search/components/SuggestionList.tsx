import { StyleSheet, View } from 'react-native';

import type { LibraryGame } from '@/db/types';
import { kindLabel, statusLabels } from '@/shared/game/labels';
import { space } from '@/theme/tokens';
import { SectionHeader } from '@/ui/SectionHeader';
import { SearchRow } from '@/views/search/components/SearchRow';

interface Props {
  games: LibraryGame[];
  highlight: string;
  onOpen: (game: LibraryGame) => void;
  onFill: (title: string) => void;
}

export const SuggestionList = ({ games, highlight, onOpen, onFill }: Props) => (
  <View style={styles.section}>
    <SectionHeader title="Suggestions" />
    <View>
      {games.map((game) => (
        <SearchRow
          key={game.id}
          title={game.title}
          highlight={highlight}
          subtitle={[kindLabel(game.gameType), game.releaseYear, statusLabels[game.status]].filter(Boolean).join(' · ')}
          coverImageId={game.coverImageId}
          accessory="fill"
          onPress={() => onOpen(game)}
          onAccessoryPress={() => onFill(game.title)}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: space[16],
  },
});
