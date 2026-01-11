import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useTheme} from '../theme';
import {Text} from './text';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (next: T) => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.wrap, {backgroundColor: theme.colors.surface2, borderColor: theme.colors.border}]}>
      {options.map(opt => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.item,
              {
                borderColor: theme.colors.border,
                backgroundColor: selected ? theme.colors.primary : 'transparent',
              },
            ]}>
            <Text
              variant="small"
              weight="bold"
              style={{
                color: selected ? '#FFFFFF' : theme.colors.textMuted,
                letterSpacing: 0.5,
              }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 6,
    gap: 6,
  },
  item: {
    flex: 1,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    overflow: 'hidden',
  },
});

