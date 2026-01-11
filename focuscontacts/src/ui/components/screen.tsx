import React from 'react';
import {SafeAreaView, StyleSheet, View, type ViewStyle} from 'react-native';
import {useTheme} from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function Screen({children, style, contentStyle}: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: theme.colors.background}, style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

