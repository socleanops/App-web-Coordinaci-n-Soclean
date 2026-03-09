import { renderHook, act, waitFor } from '@testing-library/react';
import { useFuncionarios } from '../useFuncionarios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as SupabaseLib from '@/lib/supabase';

// Mock matchMedia since it might be used somewhere by UI components in the tree
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Create a client for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFuncionarios duplicate profile error path', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('should throw Error when creating a funcionario and a profile with a funcionario already exists', async () => {
    // 1. Mock supabase to simulate existing profile & existing funcionario

    // We need to mock supabase.from().select().eq().maybeSingle() chain

    const mockMaybeSingleProfile = vi.fn().mockResolvedValue({
      data: { id: 'existing-profile-id' },
      error: null
    });

    const mockEqProfile = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingleProfile });

    const mockSelectProfile = vi.fn().mockReturnValue({ eq: mockEqProfile });

    const mockMaybeSingleFuncionario = vi.fn().mockResolvedValue({
      data: {
        id: 'existing-func-id',
        profiles: { nombre: 'John', apellido: 'Doe' }
      },
      error: null
    });

    const mockEqFuncionario = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingleFuncionario });

    const mockSelectFuncionario = vi.fn().mockReturnValue({ eq: mockEqFuncionario });

    // Mock the from function to return different chains based on table name
    const mockFrom = vi.fn((table: string) => {
      if (table === 'profiles') {
        return { select: mockSelectProfile };
      }
      if (table === 'funcionarios') {
        return { select: mockSelectFuncionario };
      }
      return { select: vi.fn() }; // fallback
    });

    vi.spyOn(SupabaseLib, 'supabase', 'get').mockReturnValue({
      from: mockFrom
    } as any);

    // 2. Render hook
    const { result } = renderHook(() => useFuncionarios(), { wrapper });

    // 3. Trigger mutation
    const formData = {
      nombre: 'Test',
      apellido: 'User',
      email: 'test@example.com',
      cedula: '1234567',
      cargo: 'Dev',
      departamento_id: 'dep-id',
      fecha_ingreso: '2024-01-01',
      direccion: 'Test Dir 123',
      tipo_contrato: 'full',
      estado: 'activo' as const,
      rol: 'funcionario' as const
    };

    act(() => {
      result.current.createFuncionario.mutate(formData);
    });

    // 4. Wait for mutation to fail and assert error
    await waitFor(() => {
      expect(result.current.createFuncionario.isError).toBe(true);
    });

    expect(result.current.createFuncionario.error?.message).toBe('Este correo/cédula ya está registrado y asignado a John Doe.');
  });
});
