import { useSharedValue } from 'react-native-reanimated';

export const useKeyboardHeight = () => useSharedValue(0);

export const useKeyboardProgress = () => useSharedValue(0);
