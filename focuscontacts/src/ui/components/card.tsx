import React from 'react';
import {StyleSheet, View, type ViewProps} from 'react-native';
import {useTheme} from '../theme';

export function Card({style, ...props}: ViewProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.xl,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
});

