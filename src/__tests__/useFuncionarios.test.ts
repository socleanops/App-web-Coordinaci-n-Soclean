// src/__tests__/useFuncionarios.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn().mockReturnValue('toast-id'),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
  },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
    },
  })),
}));

describe('useFuncionarios - toast handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cierra el toast loading y muestra error cuando la inserción de funcionario falla', async () => {
    // Mock supabase insert to return an error
    const error = new Error('Inserción fallida');
    (supabase.from as any).mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error }),
    });

    const { result } = renderHook(() => useFuncionarios());

    await act(async () => {
      try {
        await result.current.createFuncionario.mutateAsync({
          id: undefined,
          nombre: 'Test',
          apellido: 'User',
          email: undefined,
          password: undefined,
          cedula: '12345678',
          cargo: 'Operario',
          departamento_id: 'dept-1',
          direccion: 'Calle Falsa 123',
          fecha_ingreso: new Date().toISOString(),
          tipo_contrato: 'indefinido',
          rol: 'funcionario',
          estado: 'activo',
        });
      } catch (_) {
        // Expected error
      }
    });

    expect(toast.loading).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Inserción fallida', { id: 'toast-id' });
  });
});
