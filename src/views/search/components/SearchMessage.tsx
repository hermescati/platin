import { StyleSheet, View } from 'react-native';

import type { IconName } from '@/icons/Icon';
import { EmptyIllustration } from '@/ui/EmptyIllustration';
import { GlassButton } from '@/ui/GlassButton';
import { Text } from '@/ui/Text';
import { space } from '@/theme/tokens';

interface Props {
  icon: IconName;
  title: string;
  highlight?: string;
  body: string;
  action?: { label: string; icon?: IconName; onPress: () => void };
}

export const SearchMessage = ({ icon, title, highlight, body, action }: Props) => (
  <View style={styles.message}>
    <EmptyIllustration icon={icon} />
    <Text variant="title3" style={styles.title}>
      {title}
      {highlight && <Text variant="title3" tone="accent">{` “${highlight}”`}</Text>}
    </Text>
    <Text variant="subhead" tone="secondary" style={styles.body}>{body}</Text>
    {action && (
      <View style={styles.action}>
        <GlassButton label={action.label} icon={action.icon} onPress={action.onPress} />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  message: {
    marginTop: space[48],
    alignItems: 'center',
    gap: space[8],
  },
  title: {
    marginTop: space[16],
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    maxWidth: 290,
  },
  action: {
    marginTop: space[16],
  },
});
