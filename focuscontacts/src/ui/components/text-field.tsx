import React from 'react';
import {StyleSheet, TextInput, type TextInputProps, View} from 'react-native';
import {useTheme} from '../theme';
import {Text} from './text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
}

export function TextField({label, hint, error, ...props}: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="small" tone="muted" weight="semibold">
          {label}
        </Text>
      ) : null}
      <TextInput
        {...props}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface2,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />
      {error ? (
        <Text variant="small" tone="danger" weight="semibold">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="small" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});

