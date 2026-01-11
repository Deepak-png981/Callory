import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from '../ui/components/text';
import {Icon} from '../ui/components/icon';
import {useTheme} from '../ui/theme';

const icons: Record<
  string,
  {active: string; inactive: string}
> = {
  homeTab: {active: 'home', inactive: 'home-outline'},
  modesTab: {active: 'layers', inactive: 'layers-outline'},
  settingsTab: {active: 'settings', inactive: 'settings-outline'},
};

export function PillTabBar({state, descriptors, navigation}: BottomTabBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.pill, {borderColor: theme.colors.border, backgroundColor: theme.colors.surface}]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const {options} = descriptors[route.key] ?? {options: {}};
          const label =
            options.tabBarLabel ??
            options.title ??
            route.name;

          const onPress = () => {
            const event = navigation.emit({type: 'tabPress', target: route.key, canPreventDefault: true});
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name as never);
          };

          const icon = icons[route.name] ?? icons.homeTab;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              onPress={onPress}
              style={[styles.item, {borderColor: theme.colors.border}]}>
              {isFocused ? <View style={[styles.itemBg, {borderRadius: 999, backgroundColor: theme.colors.primary}]} /> : null}

              <View style={styles.itemContent}>
                <Icon
                  name={(isFocused ? icon.active : icon.inactive) as never}
                  size={20}
                  color={isFocused ? '#FFFFFF' : theme.colors.textMuted}
                />
                <Text
                  weight="bold"
                  style={{
                    color: isFocused ? '#FFFFFF' : theme.colors.textMuted,
                    fontSize: 12,
                    letterSpacing: 0.4,
                  }}>
                  {String(label).toUpperCase()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    gap: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    minHeight: 56,
    overflow: 'hidden',
  },
  itemBg: {
    ...StyleSheet.absoluteFillObject,
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});

