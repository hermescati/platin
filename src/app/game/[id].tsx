import { useLocalSearchParams } from 'expo-router';

import { GameDetailView } from '@/components/library/GameDetailView';

const GameScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <GameDetailView id={id} />;
};

export default GameScreen;
