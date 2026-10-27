import { useLocalSearchParams } from 'expo-router';

import { GameView } from '@/views/game/GameView';

const GameScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <GameView id={id} />;
};

export default GameScreen;
