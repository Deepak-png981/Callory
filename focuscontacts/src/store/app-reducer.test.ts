import {appReducer, initialAppState} from './app-reducer';

test('set_onboarding_completed updates flag', () => {
  const next = appReducer(initialAppState, {
    type: 'set_onboarding_completed',
    hasCompletedOnboarding: true,
  });
  expect(next.hasCompletedOnboarding).toBe(true);
});

test('add/remove allowed contact updates list', () => {
  const c = {
    id: '1',
    displayName: 'Alice',
    phoneNumberNormalized: '5551234567',
    contactLookupKey: null,
    createdAt: 1,
  };

  const withOne = appReducer(initialAppState, {type: 'add_allowed_contact', contact: c});
  const activeId = withOne.activeTemplateId ?? withOne.templates[0]?.id ?? null;
  const active = withOne.templates.find(t => t.id === activeId);
  expect(active?.allowedContacts ?? []).toHaveLength(1);

  const removed = appReducer(withOne, {type: 'remove_allowed_contact', id: '1'});
  const active2 = removed.templates.find(t => t.id === activeId);
  expect(active2?.allowedContacts ?? []).toHaveLength(0);
});

test('settings toggles update', () => {
  const a = appReducer(initialAppState, {type: 'set_repeat_callers_enabled', repeatCallersEnabled: true});
  const activeId = a.activeTemplateId ?? a.templates[0]?.id ?? null;
  const active = a.templates.find(t => t.id === activeId);
  expect(active?.settings.repeatCallersEnabled).toBe(true);
  const b = appReducer(a, {type: 'set_restore_stars_enabled', restoreStarsEnabled: false});
  const activeB = b.templates.find(t => t.id === activeId);
  expect(activeB?.settings.restoreStarsEnabled).toBe(false);
});


