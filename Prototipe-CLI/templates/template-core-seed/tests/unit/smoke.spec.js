import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone, isRequired } from '@/utils/validators';

describe('Smoke Test - Validators', () => {
  it('should validate emails correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('test.com')).toBe(false);
  });

  it('should validate phone numbers correctly', () => {
    expect(isValidPhone('3001234567')).toBe(true);
    expect(isValidPhone('300 123 4567')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });

  it('should validate required fields correctly', () => {
    expect(isRequired('hello')).toBe(true);
    expect(isRequired('')).toBe(false);
    expect(isRequired(null)).toBe(false);
  });
});
