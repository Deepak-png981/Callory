import {canAddAllowedContact, maxAllowedContacts} from './rules';

function makeExisting(count: number) {
  return Array.from({length: count}, (_, i) => ({
    id: String(i),
    displayName: `C${i}`,
    phoneNumberNormalized: `555000${i}`,
    contactLookupKey: null,
    createdAt: 1,
  }));
}

test('rejects invalid numbers', () => {
  const r = canAddAllowedContact([], '');
  expect(r.ok).toBe(false);
  expect(r.reason).toBe('invalid_number');
});

test('rejects duplicates', () => {
  const existing = makeExisting(1);
  const r = canAddAllowedContact(existing, existing[0]!.phoneNumberNormalized);
  expect(r.ok).toBe(false);
  expect(r.reason).toBe('duplicate');
});

test('rejects when cap reached', () => {
  const existing = makeExisting(maxAllowedContacts);
  const r = canAddAllowedContact(existing, '5551234567');
  expect(r.ok).toBe(false);
  expect(r.reason).toBe('cap_reached');
});

test('allows when under cap and not duplicate', () => {
  const existing = makeExisting(1);
  const r = canAddAllowedContact(existing, '5551234567');
  expect(r.ok).toBe(true);
});


