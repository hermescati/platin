import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { ScrollViewMarker } from 'react-native-screens/experimental';

interface Props {
  children: ReactElement;
}

const nativeProps = { collapsable: false };

export const TabScrollMarker = ({ children }: Props) => (
  <ScrollViewMarker {...nativeProps} style={styles.marker}>{children}</ScrollViewMarker>
);

const styles = StyleSheet.create({
  marker: {
    flex: 1,
  },
});
