import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';

export const useKeyboardHeight = () => useReanimatedKeyboardAnimation().height;

export const useKeyboardProgress = () => useReanimatedKeyboardAnimation().progress;
