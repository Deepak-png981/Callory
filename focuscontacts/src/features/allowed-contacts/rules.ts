import type {AllowedContact} from '../../store/types';

export const maxAllowedContacts = 5;

export interface AllowedContactAddResult {
  ok: boolean;
  reason?: 'cap_reached' | 'duplicate' | 'invalid_number';
}

export function canAddAllowedContact(
  existing: AllowedContact[],
  phoneNumberNormalized: string,
): AllowedContactAddResult {
  if (!phoneNumberNormalized) return {ok: false, reason: 'invalid_number'};
  if (existing.length >= maxAllowedContacts) return {ok: false, reason: 'cap_reached'};
  if (existing.some(c => c.phoneNumberNormalized === phoneNumberNormalized)) {
    return {ok: false, reason: 'duplicate'};
  }
  return {ok: true};
}


