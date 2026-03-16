import { describe, it, expect } from 'vitest';
import { cn, generateSecureRandomString } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges standard class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('resolves tailwind class conflicts', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('handles conditional classes', () => {
      const condition = true;
      const falseCondition = false;
      expect(cn('base-class', condition && 'active-class')).toBe('base-class active-class');
      expect(cn('base-class', falseCondition && 'hidden-class')).toBe('base-class');
    });

    it('handles arrays and objects', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2');
      expect(cn({ 'class1': true, 'class2': false })).toBe('class1');
    });

    it('handles undefined and null', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
    });
  });

  describe('generateSecureRandomString', () => {
    it('generates a string of the default length', () => {
      const str = generateSecureRandomString();
      expect(str).toHaveLength(6);
      expect(typeof str).toBe('string');
    });

    it('generates a string of the specified length', () => {
      const str = generateSecureRandomString(10);
      expect(str).toHaveLength(10);
      expect(typeof str).toBe('string');
    });
  });
});
