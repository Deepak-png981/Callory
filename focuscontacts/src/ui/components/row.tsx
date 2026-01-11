import React from 'react';
import {StyleSheet, View, type ViewProps} from 'react-native';

export function Row({style, ...props}: ViewProps) {
  return <View {...props} style={[styles.row, style]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});

