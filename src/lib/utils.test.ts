import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should concatenate standard class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes using objects', () => {
    expect(cn('base-class', { 'active-class': true, 'inactive-class': false })).toBe('base-class active-class');
  });

  it('should merge tailwind classes properly', () => {
    // p-2 should override p-4
    expect(cn('p-4', 'p-2')).toBe('p-2');

    // bg-red-500 should override bg-blue-500
    expect(cn('bg-blue-500', 'bg-red-500')).toBe('bg-red-500');

    // text-lg should override text-sm
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('should handle complex combinations of inputs', () => {
    expect(
      cn(
        'base',
        ['array-class1', 'array-class2'],
        { 'conditional-true': true, 'conditional-false': false },
        'p-4 p-2', // tailwind merge test within string
        null,
        undefined,
        false
      )
    ).toBe('base array-class1 array-class2 conditional-true p-2');
  });

  it('should handle empty inputs gracefully', () => {
    expect(cn()).toBe('');
    expect(cn('', null, undefined, false)).toBe('');
  });
});
