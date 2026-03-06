import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

// We map our role names
export type Role = 'superadmin' | 'admin' | 'supervisor' | 'facturador' | 'funcionario' | null;

interface AuthState {
    user: User | null;
    role: Role;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setRole: (role: Role) => void;
    setLoading: (loading: boolean) => void;
    signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    role: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),
    setLoading: (isLoading) => set({ isLoading }),
    signOut: () => set({ user: null, role: null }),
}));
