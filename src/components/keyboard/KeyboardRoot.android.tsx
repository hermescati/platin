import type { ReactNode } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';

interface Props {
  children: ReactNode;
}

export const KeyboardRoot = ({ children }: Props) => <KeyboardProvider>{children}</KeyboardProvider>;
