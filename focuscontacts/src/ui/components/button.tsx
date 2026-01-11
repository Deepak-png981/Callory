import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, type PressableProps, View} from 'react-native';
import {useTheme} from '../theme';
import {Text} from './text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = Boolean(disabled) || Boolean(isLoading);

  const paddingY = size === 'lg' ? 14 : 12;
  const radius = theme.radius.lg;

  const backgroundColor =
    variant === 'danger'
      ? theme.colors.danger
      : variant === 'primary'
        ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.surface2
        : 'transparent';

  const borderColor = variant === 'ghost' || variant === 'secondary' ? theme.colors.border : 'transparent';

  const labelTone =
    variant === 'secondary' || variant === 'ghost' ? 'default' : 'default';

  const labelColor =
    variant === 'secondary' || variant === 'ghost'
      ? theme.colors.text
      : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      disabled={isDisabled}
      style={({pressed}) => [
        styles.base,
        {
          paddingVertical: paddingY,
          borderRadius: radius,
          backgroundColor,
          borderColor,
          opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1,
        },
      ]}>
      <View style={styles.row}>
        {isLoading ? <ActivityIndicator color={labelColor} /> : null}
        <Text style={{color: labelColor}} tone={labelTone} weight="bold">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

