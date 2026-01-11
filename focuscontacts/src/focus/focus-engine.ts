import type {AllowedContact, DndSnapshot} from '../store/types';
import {focusNative} from '../native/focus-native';

export interface ApplyFocusInput {
  allowedContacts: AllowedContact[];
  repeatCallersEnabled: boolean;
}

export interface ApplyFocusResult {
  dndSnapshot: DndSnapshot;
  starredSnapshot: string[];
}

export async function applyFocus(input: ApplyFocusInput): Promise<ApplyFocusResult> {
  const interruptionFilter = await focusNative.dnd.getInterruptionFilter();
  const policy = await focusNative.dnd.getNotificationPolicy().catch(() => null);

  const starredBefore = await focusNative.stars.getStarredContacts();
  const starredSnapshot = starredBefore.map(c => c.lookupKey).filter(Boolean);

  // Strict allowlist: remove existing stars, then star only allowed contacts.
  for (const lookupKey of starredSnapshot) {
    await focusNative.stars.setStarredByLookupKey(lookupKey, false).catch(() => null);
  }

  for (const c of input.allowedContacts) {
    if (!c.contactLookupKey) continue;
    await focusNative.stars.setStarredByLookupKey(c.contactLookupKey, true).catch(() => null);
  }

  await focusNative.dnd.applyFocusPolicy(input.repeatCallersEnabled);

  return {
    dndSnapshot: {interruptionFilter, policy},
    starredSnapshot,
  };
}

export interface RestoreFocusInput {
  allowedContacts: AllowedContact[];
  restoreStarsEnabled: boolean;
  dndSnapshot: DndSnapshot | null;
  starredSnapshot: string[] | null;
}

export async function restoreFocus(input: RestoreFocusInput): Promise<void> {
  // Best effort restore of DND first (if we have it), then stars.
  if (input.dndSnapshot) {
    if (input.dndSnapshot.policy) {
      const p = input.dndSnapshot.policy;
      await focusNative.dnd
        .setNotificationPolicy(p.priorityCategories, p.priorityCallSenders, p.priorityMessageSenders)
        .catch(() => null);
    }

    await focusNative.dnd
      .setInterruptionFilter(input.dndSnapshot.interruptionFilter)
      .catch(() => null);
  }

  if (!input.restoreStarsEnabled) return;

  // Strict restore: ensure ONLY the snapshot contacts are starred (then Focus OFF will stop allowing calls).
  // This prevents leaving allowed contacts starred after Focus is disabled.
  const currentlyStarred = await focusNative.stars.getStarredContacts().catch(() => []);
  for (const c of currentlyStarred) {
    await focusNative.stars.setStarredByLookupKey(c.lookupKey, false).catch(() => null);
  }

  // Restore previous starred set.
  for (const lookupKey of input.starredSnapshot ?? []) {
    await focusNative.stars.setStarredByLookupKey(lookupKey, true).catch(() => null);
  }
}


