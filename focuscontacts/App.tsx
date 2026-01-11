import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation/root-navigator';
import {AppProvider} from './src/store/app-provider';
import {ThemeProvider} from './src/ui/theme';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
