import React from 'react';
import {StyleSheet, Text as RNText, type TextProps as RNTextProps} from 'react-native';
import {useTheme} from '../theme';

type Variant = 'title' | 'h2' | 'h3' | 'body' | 'small';
type Tone = 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'black';
}

const weightMap = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
} as const;

export function Text({variant = 'body', tone = 'default', weight = 'regular', style, ...rest}: TextProps) {
  const theme = useTheme();

  const color =
    tone === 'muted'
      ? theme.colors.textMuted
      : tone === 'primary'
        ? theme.colors.primary
        : tone === 'danger'
          ? theme.colors.danger
          : tone === 'success'
            ? theme.colors.success
            : tone === 'warning'
              ? theme.colors.warning
              : theme.colors.text;

  const fontSize =
    variant === 'title'
      ? theme.typography.title
      : variant === 'h2'
        ? theme.typography.h2
        : variant === 'h3'
          ? theme.typography.h3
          : variant === 'small'
            ? theme.typography.small
            : theme.typography.body;

  const lineHeight =
    variant === 'title'
      ? Math.round(fontSize * 1.12)
      : variant === 'h2'
        ? Math.round(fontSize * 1.18)
        : variant === 'h3'
          ? Math.round(fontSize * 1.22)
          : variant === 'small'
            ? Math.round(fontSize * 1.25)
            : Math.round(fontSize * 1.35);

  return (
    <RNText
      {...rest}
      style={[styles.base, {color, fontSize, lineHeight, fontWeight: weightMap[weight]}, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0.15,
  },
});

