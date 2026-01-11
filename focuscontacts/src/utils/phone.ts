export function normalizePhoneNumber(phoneNumber: string): string {
  const trimmed = phoneNumber.trim();
  if (trimmed.length === 0) return '';

  const hasLeadingPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  if (digitsOnly.length === 0) return '';

  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
}


