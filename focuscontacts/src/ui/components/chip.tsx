import React from 'react';
import {Pressable, StyleSheet, View, type ViewProps} from 'react-native';
import {useTheme} from '../theme';
import {Text} from './text';

interface ChipProps extends Omit<ViewProps, 'onTouchStart'> {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({label, selected, onPress, style, ...props}: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={[
        styles.base,
        {
          borderColor: theme.colors.border,
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface2,
          borderRadius: theme.radius.xl,
        },
        style,
      ]}>
      <Text
        variant="small"
        tone={selected ? 'default' : 'muted'}
        weight="semibold"
        style={{color: selected ? '#FFFFFF' : theme.colors.textMuted}}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
});

