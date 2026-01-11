import AsyncStorage from '@react-native-async-storage/async-storage';
import type {AppState, PersistedAppStateV1, PersistedAppStateV2} from './types';

const storageKeyV2 = 'callory:appState';
const storageKeyV1 = 'focuscontacts:appState';

export async function loadAppState(): Promise<AppState | null> {
  const raw = (await AsyncStorage.getItem(storageKeyV2)) ?? (await AsyncStorage.getItem(storageKeyV1));
  if (!raw) return null;

  const parsed: unknown = JSON.parse(raw);
  if (isPersistedV2(parsed)) return parsed.state;
  if (isPersistedV1(parsed)) return migrateV1ToV2(parsed.state);
  return null;
}

export async function saveAppState(state: AppState): Promise<void> {
  const payload: PersistedAppStateV2 = {version: 2, state};
  await AsyncStorage.setItem(storageKeyV2, JSON.stringify(payload));
}

function isPersistedV1(value: unknown): value is PersistedAppStateV1 {
  if (!value || typeof value !== 'object') return false;

  const v = value as {version?: unknown; state?: unknown};
  if (v.version !== 1) return false;
  if (!v.state || typeof v.state !== 'object') return false;

  return true;
}

function isPersistedV2(value: unknown): value is PersistedAppStateV2 {
  if (!value || typeof value !== 'object') return false;

  const v = value as {version?: unknown; state?: unknown};
  if (v.version !== 2) return false;
  if (!v.state || typeof v.state !== 'object') return false;

  return true;
}

function migrateV1ToV2(legacyState: any): AppState | null {
  if (!legacyState || typeof legacyState !== 'object') return null;

  const themeMode: 'system' | 'light' | 'dark' =
    legacyState.settings?.themeMode === 'light' || legacyState.settings?.themeMode === 'dark'
      ? legacyState.settings.themeMode
      : 'system';

  const templateSettings = {
    restoreStarsEnabled:
      typeof legacyState.settings?.restoreStarsEnabled === 'boolean'
        ? legacyState.settings.restoreStarsEnabled
        : true,
    repeatCallersEnabled:
      typeof legacyState.settings?.repeatCallersEnabled === 'boolean'
        ? legacyState.settings.repeatCallersEnabled
        : false,
  };

  const allowedContacts = Array.isArray(legacyState.allowedContacts)
    ? legacyState.allowedContacts
    : [];

  const templates = [
    {
      id: 'tpl_work',
      name: 'Work',
      allowedContacts,
      settings: templateSettings,
      schedule: null,
    },
    {
      id: 'tpl_family',
      name: 'Family',
      allowedContacts: [],
      settings: {...templateSettings},
      schedule: null,
    },
    {
      id: 'tpl_college',
      name: 'College',
      allowedContacts: [],
      settings: {...templateSettings},
      schedule: null,
    },
    {
      id: 'tpl_gym',
      name: 'Gym',
      allowedContacts: [],
      settings: {...templateSettings},
      schedule: null,
    },
  ];

  return {
    userName: legacyState.userName ?? null,
    hasCompletedOnboarding: Boolean(legacyState.hasCompletedOnboarding),
    focusEnabled: Boolean(legacyState.focusEnabled),
    templates,
    activeTemplateId: 'tpl_work',
    appliedTemplateId: legacyState.focusEnabled ? 'tpl_work' : null,
    settings: {themeMode},
    dndSnapshot: legacyState.dndSnapshot ?? null,
    starredSnapshot: legacyState.starredSnapshot ?? null,
  };
}


