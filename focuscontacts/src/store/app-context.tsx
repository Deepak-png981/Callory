import React from 'react';
import type {AppAction} from './app-reducer';
import type {AppState} from './types';

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isHydrated: boolean;
}

export const AppContext = React.createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('AppContext missing. Did you forget <AppProvider>?');
  return ctx;
}


