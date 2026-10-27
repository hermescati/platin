import { GlassView } from 'expo-lucent';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/icons/Icon';
import { Text } from '@/ui/Text';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export interface MenuItem {
  key: string;
  label: string;
  sub?: string;
  icon?: IconName;
  destructive?: boolean;
  groupStart?: boolean;
}

interface Props {
  title?: string;
  items: MenuItem[];
  selected?: string | string[];
  onSelect: (key: string) => void;
}

export const Menu = ({ title, items, selected, onSelect }: Props) => {
  const { color } = useTheme();

  return (
    <GlassView style={styles.menu} tintColor={color.menu.fill} accessibilityRole="menu">
      {title ? (
        <Text variant="footnote" tone="secondary" style={styles.title}>{title}</Text>
      ) : (
        <View style={styles.edge} />
      )}
      {items.map((item, index) => {
        const isSelected = Array.isArray(selected) ? selected.includes(item.key) : item.key === selected;
        const tint = item.destructive ? color.status.danger : isSelected ? color.accent.default : color.text.primary;
        return (
          <Fragment key={item.key}>
            {index > 0 && (
              <View
                style={[
                  styles.rule,
                  { backgroundColor: color.line.hairline },
                  item.groupStart ? styles.groupRule : styles.itemRule,
                ]}
              />
            )}
            <Pressable
              onPress={() => onSelect(item.key)}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.line.track }]}>
              <View style={styles.text}>
                <View style={styles.labelLine}>
                  <Text variant={isSelected ? 'headline' : 'body'} style={{ color: tint }}>{item.label}</Text>
                  {isSelected && <Icon name="check" size={14} weight="bold" color={tint} />}
                </View>
                {item.sub && <Text variant="footnote" tone="secondary">{item.sub}</Text>}
              </View>
              <View style={styles.iconSlot}>{item.icon && <Icon name={item.icon} size={20} color={tint} />}</View>
            </Pressable>
          </Fragment>
        );
      })}
      <View style={styles.edge} />
    </GlassView>
  );
};

const styles = StyleSheet.create({
  menu: {
    width: layout.menuWidth,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  title: {
    paddingHorizontal: space[16],
    paddingTop: space[16],
    paddingBottom: space[4],
  },
  edge: {
    height: space[8],
  },
  rule: {
    height: layout.hairline,
  },
  itemRule: {
    marginHorizontal: space[16],
  },
  groupRule: {
    marginHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[8],
    marginHorizontal: space[8],
    padding: space[8],
    minHeight: layout.menuRow,
    borderRadius: radius.md,
  },
  text: {
    flex: 1,
    gap: space[2],
  },
  labelLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[6],
  },
  iconSlot: {
    width: layout.menuIconSlot,
    alignItems: 'center',
  },
});
