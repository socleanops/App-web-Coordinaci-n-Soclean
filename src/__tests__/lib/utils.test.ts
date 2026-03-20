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
  });
});
