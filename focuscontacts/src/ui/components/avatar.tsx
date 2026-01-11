import React from 'react';
import {StyleSheet, View, type ViewProps} from 'react-native';
import {useTheme} from '../theme';
import {Text} from './text';

interface AvatarProps extends ViewProps {
  name: string;
  size?: number;
}

export function Avatar({name, size = 40, style, ...props}: AvatarProps) {
  const theme = useTheme();
  const initial = (name.trim()[0] || '?').toUpperCase();

  return (
    <View
      {...props}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.surface2,
          borderColor: theme.colors.border,
        },
        style,
      ]}>
      <Text weight="black" style={{fontSize: Math.max(12, Math.floor(size / 2.4))}}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

