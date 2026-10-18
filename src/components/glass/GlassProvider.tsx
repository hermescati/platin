import { createContext, useContext, useRef, type ComponentRef, type ReactNode, type RefObject } from 'react';
import type { View } from 'react-native';

type GlassTarget = RefObject<ComponentRef<typeof View> | null>;

const GlassTargetContext = createContext<GlassTarget | null>(null);

interface Props {
  children: ReactNode;
}

export const GlassProvider = ({ children }: Props) => {
  const target = useRef<ComponentRef<typeof View>>(null);

  return <GlassTargetContext value={target}>{children}</GlassTargetContext>;
};

export const useGlassTarget = (): GlassTarget | null => useContext(GlassTargetContext);
