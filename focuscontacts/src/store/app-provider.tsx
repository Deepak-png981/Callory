import React from 'react';
import {Platform} from 'react-native';
import {appReducer, initialAppState} from './app-reducer';
import {AppContext} from './app-context';
import {loadAppState, saveAppState} from './storage';
import {focusNative} from '../native/focus-native';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({children}: AppProviderProps) {
  const [state, dispatch] = React.useReducer(appReducer, initialAppState);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    let isCancelled = false;

    async function hydrate() {
      try {
        const persisted = await loadAppState();
        if (!persisted) return;
        if (isCancelled) return;
        dispatch({type: 'hydrate', state: persisted});
      } finally {
        if (!isCancelled) setIsHydrated(true);
      }
    }

    hydrate();
    return () => {
      isCancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!isHydrated) return;
    saveAppState(state).catch(() => {
      // best-effort persistence in V1
    });
  }, [isHydrated, state]);

  React.useEffect(() => {
    if (!isHydrated) return;
    if (Platform.OS !== 'android') return;
    // Keep native automation scheduler in sync so schedules work even when the app is closed.
    focusNative.automation
      .syncTemplatesJson(JSON.stringify(state.templates))
      .catch(() => null);
  }, [isHydrated, state.templates]);

  const value = React.useMemo(() => ({state, dispatch, isHydrated}), [state, dispatch, isHydrated]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}


