import React from 'react';
import {useColorScheme} from 'react-native';
import {useAppContext} from '../store/app-context';

export interface AppTheme {
  colors: {
    background: string;
    surface: string;
    surface2: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    primary2: string;
    success: string;
    danger: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    title: number;
    h2: number;
    h3: number;
    body: number;
    small: number;
  };
}

const spacing = {xs: 6, sm: 10, md: 14, lg: 18, xl: 24};
const radius = {md: 12, lg: 16, xl: 22};
// Slightly richer, more modern typography scale (better hierarchy on Android)
const typography = {title: 34, h2: 26, h3: 18, body: 15, small: 13};

function getThemeColors(mode: 'system' | 'light' | 'dark', system: 'light' | 'dark' | null) {
  const resolved = mode === 'system' ? system ?? 'light' : mode;
  const isDark = resolved === 'dark';

  return isDark
      ? {
          background: '#0B0F19',
          surface: '#12192A',
          surface2: '#0F1626',
          text: '#F4F6FB',
          textMuted: '#AAB4CF',
          border: 'rgba(255,255,255,0.10)',
          primary: '#7C5CFF',
          primary2: '#22D3EE',
          success: '#22C55E',
          danger: '#FB7185',
          warning: '#FBBF24',
        }
      : {
          background: '#F7F8FC',
          surface: '#FFFFFF',
          surface2: '#F2F4FB',
          text: '#0B1020',
          textMuted: '#4B587C',
          border: 'rgba(10,20,40,0.10)',
          // Keep the earlier “clean minimal” feel in light mode (user preferred previous colors)
          primary: '#2563EB',
          primary2: '#7C3AED',
          success: '#16A34A',
          danger: '#E11D48',
          warning: '#D97706',
        };
}

const ThemeContext = React.createContext<AppTheme | null>(null);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const {state} = useAppContext();
  const system = useColorScheme();
  const theme: AppTheme = React.useMemo(
    () => ({
      colors: getThemeColors(state.settings.themeMode, system),
      spacing,
      radius,
      typography,
    }),
    [state.settings.themeMode, system],
  );

  return React.createElement(ThemeContext.Provider, {value: theme}, children);
}

export function useTheme(): AppTheme {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    // Fallback for any callsites before provider wraps the tree.
    const system = useColorScheme();
    return {colors: getThemeColors('system', system), spacing, radius, typography};
  }
  return ctx;
}

