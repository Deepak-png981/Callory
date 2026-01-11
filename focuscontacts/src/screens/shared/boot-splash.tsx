import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from '../../ui/theme';
import {Text} from '../../ui/components/text';

export function BootSplash() {
  const theme = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.content}>
        <View
          style={[
            styles.logo,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        />
        <Text variant="h2" weight="black">
          Callory
        </Text>
        <Text tone="muted" style={{textAlign: 'center'}}>
          Loading…
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

