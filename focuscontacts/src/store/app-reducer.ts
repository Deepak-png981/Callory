import type {
  AllowedContact,
  AppState,
  DndSnapshot,
  FocusTemplate,
  TemplateSchedule,
  TemplateSettings,
} from './types';

const defaultTemplateSettings: TemplateSettings = {
  restoreStarsEnabled: true,
  repeatCallersEnabled: false,
};

function createStarterTemplates(): FocusTemplate[] {
  return [
    {id: 'tpl_work', name: 'Work', allowedContacts: [], settings: {...defaultTemplateSettings}, schedule: null},
    {id: 'tpl_family', name: 'Family', allowedContacts: [], settings: {...defaultTemplateSettings}, schedule: null},
    {id: 'tpl_college', name: 'College', allowedContacts: [], settings: {...defaultTemplateSettings}, schedule: null},
    {id: 'tpl_gym', name: 'Gym', allowedContacts: [], settings: {...defaultTemplateSettings}, schedule: null},
  ];
}

function getActiveTemplateId(state: AppState): string | null {
  return state.activeTemplateId ?? state.templates[0]?.id ?? null;
}

function updateTemplateById(
  templates: FocusTemplate[],
  templateId: string,
  updater: (t: FocusTemplate) => FocusTemplate,
): FocusTemplate[] {
  const idx = templates.findIndex(t => t.id === templateId);
  if (idx === -1) return templates;
  const copy = templates.slice();
  copy[idx] = updater(copy[idx]!);
  return copy;
}

export interface AppActionSetOnboardingCompleted {
  type: 'set_onboarding_completed';
  hasCompletedOnboarding: boolean;
}

export interface AppActionSetUserName {
  type: 'set_user_name';
  userName: string | null;
}

export interface AppActionSetFocusEnabled {
  type: 'set_focus_enabled';
  focusEnabled: boolean;
  appliedTemplateId?: string | null;
}

export interface AppActionAddAllowedContact {
  type: 'add_allowed_contact';
  contact: AllowedContact;
}

export interface AppActionRemoveAllowedContact {
  type: 'remove_allowed_contact';
  id: string;
}

export interface AppActionClearAllowedContacts {
  type: 'clear_allowed_contacts';
}

export interface AppActionSetRestoreStarsEnabled {
  type: 'set_restore_stars_enabled';
  restoreStarsEnabled: boolean;
}

export interface AppActionSetRepeatCallersEnabled {
  type: 'set_repeat_callers_enabled';
  repeatCallersEnabled: boolean;
}

export interface AppActionSetThemeMode {
  type: 'set_theme_mode';
  themeMode: 'system' | 'light' | 'dark';
}

export interface AppActionSetFocusSnapshots {
  type: 'set_focus_snapshots';
  dndSnapshot: DndSnapshot | null;
  starredSnapshot: string[] | null;
}

export interface AppActionHydrate {
  type: 'hydrate';
  state: AppState;
}

export interface AppActionSetActiveTemplate {
  type: 'set_active_template';
  templateId: string;
}

export interface AppActionCreateTemplate {
  type: 'create_template';
  template: FocusTemplate;
}

export interface AppActionUpdateTemplate {
  type: 'update_template';
  templateId: string;
  patch: Partial<{
    name: string;
    allowedContacts: AllowedContact[];
    settings: TemplateSettings;
    schedule: TemplateSchedule | null;
  }>;
}

export interface AppActionDeleteTemplate {
  type: 'delete_template';
  templateId: string;
}

export type AppAction =
  | AppActionHydrate
  | AppActionSetUserName
  | AppActionSetOnboardingCompleted
  | AppActionSetFocusEnabled
  | AppActionAddAllowedContact
  | AppActionRemoveAllowedContact
  | AppActionClearAllowedContacts
  | AppActionSetRestoreStarsEnabled
  | AppActionSetRepeatCallersEnabled
  | AppActionSetThemeMode
  | AppActionSetFocusSnapshots
  | AppActionSetActiveTemplate
  | AppActionCreateTemplate
  | AppActionUpdateTemplate
  | AppActionDeleteTemplate;

export const initialAppState: AppState = {
  userName: null,
  hasCompletedOnboarding: false,
  focusEnabled: false,
  templates: createStarterTemplates(),
  activeTemplateId: 'tpl_work',
  appliedTemplateId: null,
  settings: {
    themeMode: 'system',
  },
  dndSnapshot: null,
  starredSnapshot: null,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'set_user_name':
      return {...state, userName: action.userName};
    case 'set_onboarding_completed':
      return {...state, hasCompletedOnboarding: action.hasCompletedOnboarding};
    case 'set_focus_enabled':
      return {
        ...state,
        focusEnabled: action.focusEnabled,
        appliedTemplateId: action.focusEnabled
          ? action.appliedTemplateId ?? getActiveTemplateId(state)
          : null,
      };
    case 'add_allowed_contact':
      return (() => {
        const activeId = getActiveTemplateId(state);
        if (!activeId) return state;
        return {
          ...state,
          templates: updateTemplateById(state.templates, activeId, t => ({
            ...t,
            allowedContacts: [action.contact, ...t.allowedContacts],
          })),
          activeTemplateId: activeId,
        };
      })();
    case 'remove_allowed_contact':
      return (() => {
        const activeId = getActiveTemplateId(state);
        if (!activeId) return state;
        return {
          ...state,
          templates: updateTemplateById(state.templates, activeId, t => ({
            ...t,
            allowedContacts: t.allowedContacts.filter(c => c.id !== action.id),
          })),
          activeTemplateId: activeId,
        };
      })();
    case 'clear_allowed_contacts':
      return (() => {
        const activeId = getActiveTemplateId(state);
        if (!activeId) return state;
        return {
          ...state,
          templates: updateTemplateById(state.templates, activeId, t => ({
            ...t,
            allowedContacts: [],
          })),
          activeTemplateId: activeId,
        };
      })();
    case 'set_restore_stars_enabled':
      return (() => {
        const activeId = getActiveTemplateId(state);
        if (!activeId) return state;
        return {
          ...state,
          templates: updateTemplateById(state.templates, activeId, t => ({
            ...t,
            settings: {...t.settings, restoreStarsEnabled: action.restoreStarsEnabled},
          })),
          activeTemplateId: activeId,
        };
      })();
    case 'set_repeat_callers_enabled':
      return (() => {
        const activeId = getActiveTemplateId(state);
        if (!activeId) return state;
        return {
          ...state,
          templates: updateTemplateById(state.templates, activeId, t => ({
            ...t,
            settings: {...t.settings, repeatCallersEnabled: action.repeatCallersEnabled},
          })),
          activeTemplateId: activeId,
        };
      })();
    case 'set_theme_mode':
      return {
        ...state,
        settings: {...state.settings, themeMode: action.themeMode},
      };
    case 'set_focus_snapshots':
      return {
        ...state,
        dndSnapshot: action.dndSnapshot,
        starredSnapshot: action.starredSnapshot,
      };
    case 'set_active_template':
      return {
        ...state,
        activeTemplateId: action.templateId,
      };
    case 'create_template':
      return {
        ...state,
        templates: [action.template, ...state.templates],
        activeTemplateId: action.template.id,
      };
    case 'update_template':
      return {
        ...state,
        templates: updateTemplateById(state.templates, action.templateId, t => ({
          ...t,
          ...action.patch,
        })),
      };
    case 'delete_template': {
      const nextTemplates = state.templates.filter(t => t.id !== action.templateId);
      const nextActive =
        state.activeTemplateId === action.templateId
          ? nextTemplates[0]?.id ?? null
          : state.activeTemplateId;
      const nextApplied =
        state.appliedTemplateId === action.templateId ? null : state.appliedTemplateId;
      return {
        ...state,
        templates: nextTemplates,
        activeTemplateId: nextActive,
        appliedTemplateId: nextApplied,
      };
    }
    default:
      return state;
  }
}


