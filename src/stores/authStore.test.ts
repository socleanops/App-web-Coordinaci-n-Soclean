import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '@supabase/supabase-js';

describe('useAuthStore', () => {
    // Reset the store state before each test
    beforeEach(() => {
        useAuthStore.setState({
            user: null,
            role: null,
            isLoading: true,
        });
    });

    it('should have correct initial state', () => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.role).toBeNull();
        expect(state.isLoading).toBe(true);
    });

    it('should update user when setUser is called', () => {
        const mockUser = { id: 'user123', email: 'test@example.com' } as User;

        useAuthStore.getState().setUser(mockUser);

        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
    });

    it('should update role when setRole is called', () => {
        const mockRole = 'admin';

        useAuthStore.getState().setRole(mockRole);

        const state = useAuthStore.getState();
        expect(state.role).toBe(mockRole);
    });

    it('should update isLoading when setLoading is called', () => {
        useAuthStore.getState().setLoading(false);

        const state = useAuthStore.getState();
        expect(state.isLoading).toBe(false);
    });

    it('should reset user and role when signOut is called', () => {
        const mockUser = { id: 'user123', email: 'test@example.com' } as User;
        const mockRole = 'admin';

        // Set initial logged in state
        useAuthStore.setState({
            user: mockUser,
            role: mockRole,
            isLoading: false,
        });

        useAuthStore.getState().signOut();

        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.role).toBeNull();
        // signOut does not explicitly change isLoading in the current code
        expect(state.isLoading).toBe(false);
    });
});
