import {NativeModules} from 'react-native';

const {DndModule, ContactPickerModule, StarManagerModule, AutomationModule} = NativeModules as {
  DndModule: {
    isPolicyAccessGranted(): Promise<boolean>;
    openPolicyAccessSettings(): Promise<null>;
    getInterruptionFilter(): Promise<number>;
    setInterruptionFilter(interruptionFilter: number): Promise<null>;
    getNotificationPolicy(): Promise<{
      priorityCategories: number;
      priorityCallSenders: number;
      priorityMessageSenders: number;
    }>;
    setNotificationPolicy(
      priorityCategories: number,
      priorityCallSenders: number,
      priorityMessageSenders: number,
    ): Promise<null>;
    applyFocusPolicy(allowRepeatCallers: boolean): Promise<null>;
  };
  ContactPickerModule: {
    pickContact(): Promise<
      | null
      | {
          contactId: string;
          lookupKey: string;
          displayName: string | null;
          contactUri: string;
          phoneNumbers: string[];
        }
    >;
  };
  StarManagerModule: {
    getStarredContacts(): Promise<
      Array<{contactId: string; lookupKey: string; displayName: string | null}>
    >;
    setStarredByLookupKey(lookupKey: string, starred: boolean): Promise<null>;
  };
  AutomationModule: {
    syncTemplatesJson(templatesJson: string): Promise<null>;
    rescheduleAll(): Promise<null>;
  };
};

const noopAutomation = {
  syncTemplatesJson: async (_templatesJson: string) => null,
  rescheduleAll: async () => null,
};

export const focusNative = {
  dnd: DndModule,
  picker: ContactPickerModule,
  stars: StarManagerModule,
  automation: AutomationModule ?? noopAutomation,
};


