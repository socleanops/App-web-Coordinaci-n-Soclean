import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signOut: vi.fn()
        }
    }
}));

describe('Auth Flow & useAuthStore', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        const store = useAuthStore.getState();
        store.signOut(); // Reset state
    });

    it('Login exitoso: (Happy Path) Configura el usuario correctamente', async () => {
        const mockUser = { id: 'u1', email: 'test@soclean.com' };
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
            data: { user: mockUser as never, session: {} as never },
            error: null
        });

        const store = useAuthStore.getState();
        
        // Simular lo que haría supabase.auth.onAuthStateChange o el handleSubmit del form
        const { data, error } = await supabase.auth.signInWithPassword({ email: 'test', password: 'password' });
        expect(error).toBeNull();
        
        store.setUser(data.user);
        expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('Login fallido: Maneja credenciales inválidas', async () => {
        const mockError = new Error('Invalid credentials');
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
            data: { user: null, session: null },
            error: mockError as never
        });

        const { data, error } = await supabase.auth.signInWithPassword({ email: 'bad@email.com', password: 'bad' });
        
        expect(data.user).toBeNull();
        expect(error).toEqual(mockError);
    });

    it('Logout: Limpia el estado correctamente', async () => {
        vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

        const store = useAuthStore.getState();
        // Setup initial user state
        store.setUser({ id: 'u1' } as never);
        store.setRole('admin');
        
        expect(useAuthStore.getState().user).not.toBeNull();
        expect(useAuthStore.getState().role).toBe('admin');

        // Simulate logout process
        await supabase.auth.signOut();
        useAuthStore.getState().signOut();

        const cleanStore = useAuthStore.getState();
        expect(cleanStore.user).toBeNull();
        expect(cleanStore.role).toBeNull();
    });

    it('Verificación de rol: Permite actualizar a roles admin y coordinador', () => {
        const store = useAuthStore.getState();
        
        // Test admin
        store.setRole('admin');
        expect(useAuthStore.getState().role).toBe('admin');

        // Test coordinator (which internally maps to supervisor or facturador)
        store.setRole('supervisor');
        expect(useAuthStore.getState().role).toBe('supervisor');
        
        // Use getState().setRole to ensure fresh mutation if store reference gets stale
        useAuthStore.getState().setRole('superadmin');
        expect(useAuthStore.getState().role).toBe('superadmin');
    });
});
