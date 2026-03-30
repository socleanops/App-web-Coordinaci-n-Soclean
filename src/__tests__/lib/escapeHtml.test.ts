import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../lib/utils';

describe('escapeHtml', () => {
    it('escapes html entities', () => {
        expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });
});
