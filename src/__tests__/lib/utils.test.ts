import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateComplexPassword } from '../../lib/utils';

describe('generateComplexPassword', () => {
  beforeEach(() => {
    // Basic mock of window.crypto.getRandomValues for vitest/jsdom if not fully supported
    if (!window.crypto) {
      Object.defineProperty(window, 'crypto', {
        value: {
          getRandomValues: (arr: Uint32Array) => {
            for (let i = 0; i < arr.length; i++) {
              arr[i] = Math.floor(Math.random() * 4294967296);
            }
            return arr;
          }
        }
      });
    }
  });

  it('generates a password of the correct length', () => {
    const password = generateComplexPassword(16);
    expect(password).toHaveLength(16);
  });

  it('generates a password of default length 12', () => {
    const password = generateComplexPassword();
    expect(password).toHaveLength(12);
  });

  it('contains at least one uppercase letter', () => {
    const password = generateComplexPassword();
    expect(password).toMatch(/[A-Z]/);
  });

  it('contains at least one lowercase letter', () => {
    const password = generateComplexPassword();
    expect(password).toMatch(/[a-z]/);
  });

  it('contains at least one number', () => {
    const password = generateComplexPassword();
    expect(password).toMatch(/[0-9]/);
  });

  it('contains at least one special character', () => {
    const password = generateComplexPassword();
    expect(password).toMatch(/[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/);
import { describe, it, expect } from 'vitest';
import { generateSecureRandomString, generateComplexPassword } from '../../lib/utils';

// Mock window.crypto.getRandomValues for jsdom environment if not present
// Using Object.defineProperty to ensure it's available in the global scope
if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.getRandomValues)) {
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: (arr: Uint32Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 0xffffffff);
        }
        return arr;
      },
    },
    configurable: true
  });
}

describe('utils', () => {
  describe('generateSecureRandomString', () => {
    it('should generate a string of default length 6', () => {
      const result = generateSecureRandomString();
      expect(result).toHaveLength(6);
      expect(typeof result).toBe('string');
    });

    it('should generate a string of custom length', () => {
      const result = generateSecureRandomString(10);
      expect(result).toHaveLength(10);
    });

    it('should generate different strings on successive calls', () => {
      const s1 = generateSecureRandomString(12);
      const s2 = generateSecureRandomString(12);
      expect(s1).not.toBe(s2);
    });
  });

  describe('generateComplexPassword', () => {
    it('should generate a password of default length 12', () => {
      const result = generateComplexPassword();
      expect(result).toHaveLength(12);
    });

    it('should generate a password of custom length', () => {
      const result = generateComplexPassword(16);
      expect(result).toHaveLength(16);
    });

    it('should contain at least one of each required character type', () => {
      const result = generateComplexPassword(12);

      const hasLower = /[a-z]/.test(result);
      const hasUpper = /[A-Z]/.test(result);
      const hasNum = /[0-9]/.test(result);
      // Updated regex to escape special characters correctly for test
      const hasSpecial = /[!@#$%^&*()_+~`|}{[\]:;?><,./\-=]/.test(result);

      expect(hasLower).toBe(true, `Password "${result}" should contain a lowercase letter`);
      expect(hasUpper).toBe(true, `Password "${result}" should contain an uppercase letter`);
      expect(hasNum).toBe(true, `Password "${result}" should contain a number`);
      expect(hasSpecial).toBe(true, `Password "${result}" should contain a special character`);
    });

    it('should generate different passwords on successive calls', () => {
      const p1 = generateComplexPassword(12);
      const p2 = generateComplexPassword(12);
      expect(p1).not.toBe(p2);
    });

    it('should work with minimum length 4', () => {
      const result = generateComplexPassword(4);
      expect(result).toHaveLength(4);

      expect(/[a-z]/.test(result)).toBe(true);
      expect(/[A-Z]/.test(result)).toBe(true);
      expect(/[0-9]/.test(result)).toBe(true);
      expect(/[!@#$%^&*()_+~`|}{[\]:;?><,./\-=]/.test(result)).toBe(true);
    });
  });
});
