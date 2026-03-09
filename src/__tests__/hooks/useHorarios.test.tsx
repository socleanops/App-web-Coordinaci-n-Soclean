import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHorarios } from '@/hooks/useHorarios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';
import { ReactNode } from 'react';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      }
    },
  });

  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  };
};

describe('useHorarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHorarios', () => {
    it('should fetch horarios successfully', async () => {
      const mockData = [{ id: '1', funcionario_id: 'user1' }];

      const mockOrder2 = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 });

      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useHorarios(), { wrapper });

      await waitFor(() => {
        expect(result.current.getHorarios.isSuccess).toBe(true);
      });

      expect(result.current.getHorarios.data).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('horarios');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockOrder1).toHaveBeenCalledWith('dia_semana', { ascending: true });
      expect(mockOrder2).toHaveBeenCalledWith('hora_entrada', { ascending: true });
    });

    it('should handle error when fetching horarios', async () => {
      const mockError = new Error('Failed to fetch');

      const mockOrder2 = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 });

      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useHorarios(), { wrapper });

      await waitFor(() => {
        expect(result.current.getHorarios.isError).toBe(true);
      });

      expect(result.current.getHorarios.error).toEqual(mockError);
    });
  });

  describe('createHorario', () => {
    it('should create a horario successfully', async () => {
      const mockFormData: any = {
        funcionario_id: '1',
        dia_semana: 1,
        hora_entrada: '08:00',
        hora_salida: '17:00'
      };

      const mockData = { id: 'new_id', ...mockFormData };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockReturnValue({ insert: mockInsert });

      const { wrapper, queryClient } = createWrapper();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useHorarios(), { wrapper });

      result.current.createHorario.mutate(mockFormData);

      await waitFor(() => {
        expect(result.current.createHorario.isSuccess).toBe(true);
      });

      expect(supabase.from).toHaveBeenCalledWith('horarios');
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockFormData,
        vigente_hasta: null
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['horarios'] });
    });

    it('should handle error when creating a horario', async () => {
      const mockFormData: any = { funcionario_id: '1' };
      const mockError = new Error('Creation failed');

      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockReturnValue({ insert: mockInsert });

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useHorarios(), { wrapper });

      result.current.createHorario.mutate(mockFormData);

      await waitFor(() => {
        expect(result.current.createHorario.isError).toBe(true);
      });

      expect(result.current.createHorario.error).toEqual(mockError);
    });
  });

  describe('updateHorario', () => {
    it('should update a horario successfully', async () => {
      const mockId = '1';
      const mockUpdateData: any = {
        hora_entrada: '09:00'
      };

      const mockData = { id: mockId, ...mockUpdateData };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as any).mockReturnValue({ update: mockUpdate });

      const { wrapper, queryClient } = createWrapper();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useHorarios(), { wrapper });

      result.current.updateHorario.mutate({ id: mockId, data: mockUpdateData });

      await waitFor(() => {
        expect(result.current.updateHorario.isSuccess).toBe(true);
      });

      expect(supabase.from).toHaveBeenCalledWith('horarios');
      expect(mockUpdate).toHaveBeenCalledWith({
        ...mockUpdateData,
        vigente_hasta: null
      });
      expect(mockEq).toHaveBeenCalledWith('id', mockId);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['horarios'] });
    });
  });

  describe('deleteHorario', () => {
    it('should delete a horario successfully', async () => {
      const mockId = '1';

      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as any).mockReturnValue({ delete: mockDelete });

      const { wrapper, queryClient } = createWrapper();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useHorarios(), { wrapper });

      result.current.deleteHorario.mutate(mockId);

      await waitFor(() => {
        expect(result.current.deleteHorario.isSuccess).toBe(true);
      });

      expect(supabase.from).toHaveBeenCalledWith('horarios');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', mockId);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['horarios'] });
    });
  });
});
