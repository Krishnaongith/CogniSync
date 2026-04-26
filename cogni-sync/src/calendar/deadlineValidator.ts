export function validateDeadline(value: string): { valid: boolean; error?: string } {
  if (value === '') return { valid: true };
  const parsed = Date.parse(value);
  if (isNaN(parsed)) return { valid: false, error: 'Invalid date format' };
  return { valid: true };
}
