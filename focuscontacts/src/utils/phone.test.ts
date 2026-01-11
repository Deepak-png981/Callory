import {normalizePhoneNumber} from './phone';

test('normalizePhoneNumber strips formatting', () => {
  expect(normalizePhoneNumber(' (555) 123-4567 ')).toBe('5551234567');
});

test('normalizePhoneNumber preserves leading plus', () => {
  expect(normalizePhoneNumber('+1 (555) 123-4567')).toBe('+15551234567');
});

test('normalizePhoneNumber returns empty for empty input', () => {
  expect(normalizePhoneNumber('   ')).toBe('');
});


