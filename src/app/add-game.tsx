import { useLocalSearchParams } from 'expo-router';

import { AddGameSheet } from '@/views/add-game/AddGameSheet';
import type { CatalogGame } from '@/lib/catalog';

const AddGameScreen = () => {
  const { game } = useLocalSearchParams<{ game: string }>();

  return <AddGameSheet game={JSON.parse(game) as CatalogGame} />;
};

export default AddGameScreen;
