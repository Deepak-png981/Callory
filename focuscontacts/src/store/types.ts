export interface AllowedContact {
  id: string;
  displayName: string;
  phoneNumberNormalized: string;
  contactLookupKey: string | null;
  createdAt: number;
}

export interface TemplateSettings {
  restoreStarsEnabled: boolean;
  repeatCallersEnabled: boolean;
}

export interface TemplateSchedule {
  enabled: boolean;
  daysOfWeek: number[]; // 0=Sun ... 6=Sat
  startMinutes: number; // minutes since midnight
  endMinutes: number; // minutes since midnight (can be < startMinutes for overnight)
}

export interface FocusTemplate {
  id: string;
  name: string;
  allowedContacts: AllowedContact[];
  settings: TemplateSettings;
  schedule: TemplateSchedule | null;
}

export interface AppSettings {
  themeMode: 'system' | 'light' | 'dark';
}

export interface DndPolicySnapshot {
  priorityCategories: number;
  priorityCallSenders: number;
  priorityMessageSenders: number;
}

export interface DndSnapshot {
  interruptionFilter: number;
  policy: DndPolicySnapshot | null;
}

export interface AppState {
  userName: string | null;
  hasCompletedOnboarding: boolean;
  focusEnabled: boolean;
  templates: FocusTemplate[];
  activeTemplateId: string | null;
  appliedTemplateId: string | null;
  settings: AppSettings;
  dndSnapshot: DndSnapshot | null;
  starredSnapshot: string[] | null;
}

export interface PersistedAppStateV1 {
  version: 1;
  state: any;
}

export interface PersistedAppStateV2 {
  version: 2;
  state: AppState;
}


