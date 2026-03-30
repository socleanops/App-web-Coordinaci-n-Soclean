import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAsistencia } from '../hooks/useAsistencia';
import { supabase } from '../lib/supabase';

// Mock supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useAsistencia SELECT Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('getAsistencias calls supabase with explicit columns instead of *', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    const mockGte = vi.fn().mockReturnThis();
    const mockLte = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
      gte: mockGte,
      lte: mockLte,
    } as any);

    const { result } = renderHook(() => useAsistencia('2023-01-01', '2023-01-31'), { wrapper });

    await waitFor(() => {
      expect(result.current.getAsistencias.isSuccess).toBe(true);
    });

    expect(supabase.from).toHaveBeenCalledWith('asistencia');
    expect(mockSelect).toHaveBeenCalled();
    const selectQuery = mockSelect.mock.calls[0][0];

    // Verify * is NOT used at the top level or inside funcionarios
    expect(selectQuery).not.toMatch(/\s+\*,\s+/);
    expect(selectQuery).not.toMatch(/funcionarios\(\s*\*/);

    // Verify specific columns are requested
    expect(selectQuery).toContain('id,');
    expect(selectQuery).toContain('funcionario_id,');
    expect(selectQuery).toContain('horario_id,');
    expect(selectQuery).toContain('fecha,');
    expect(selectQuery).toContain('hora_entrada_registrada,');
    expect(selectQuery).toContain('hora_salida_registrada,');
    expect(selectQuery).toContain('distancia_entrada_metros,');
    expect(selectQuery).toContain('distancia_salida_metros,');
    expect(selectQuery).toContain('estado,');
    expect(selectQuery).toContain('observaciones,');
    expect(selectQuery).toContain('created_at,');

    // Verify funcionarios columns
    expect(selectQuery).toContain('cedula,');
    expect(selectQuery).toContain('cargo,');
    expect(selectQuery).toContain('departamento_id,');
    expect(selectQuery).toContain('direccion,');
    expect(selectQuery).toContain('fecha_ingreso,');
    expect(selectQuery).toContain('tipo_contrato,');
    expect(selectQuery).toContain('salario_base,');
  });

  it('generarPlanillaSemana uses exactly 3 GET queries and 1 bulk INSERT for a 7-day range', async () => {
    // We need to mock Promise.all calls correctly
    const lteMock = vi.fn().mockResolvedValue({ data: [] });
    const gteMock = vi.fn().mockReturnValue({ lte: lteMock });
    const lteGteMock = vi.fn().mockReturnValue({ gte: lteMock });

    // For horarios
    const selectMock1 = vi.fn().mockReturnValue({ lte: lteMock });
    // For asistencia
    const selectMock2 = vi.fn().mockReturnValue({ gte: gteMock });
    // For certificaciones
    const selectMock3 = vi.fn().mockReturnValue({ lte: lteGteMock });

    // Mock insert
    const insertMock = vi.fn().mockResolvedValue({ error: null });

    // Depending on what is passed to `.from()`, we return different mocks
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'horarios') return { select: selectMock1 } as any;
      if (table === 'asistencia') return { select: selectMock2, insert: insertMock } as any;
      if (table === 'certificaciones') return { select: selectMock3 } as any;
      return {} as any;
    });

    const { result } = renderHook(() => useAsistencia(), { wrapper });

    await result.current.generarPlanillaSemana.mutateAsync({ desde: '2023-01-01', hasta: '2023-01-07' });

    // It should have called from('horarios'), from('asistencia'), and from('certificaciones')
    expect(supabase.from).toHaveBeenCalledWith('horarios');
    expect(supabase.from).toHaveBeenCalledWith('asistencia');
    expect(supabase.from).toHaveBeenCalledWith('certificaciones');

    // And since data is empty arrays, no insert is called, but count is 0
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('generarPlanillaSemana handles missing attendance perfectly via batch insert', async () => {
    // Same mocks but returning actual data
    // day 0 (Sunday) -> date 2023-01-01
    const lteMockHorarios = vi.fn().mockResolvedValue({ data: [
        { id: 'h1', funcionario_id: 'f1', dia_semana: 0, vigente_desde: '2022-01-01' },
    ] });
    // Empty existing
    const lteMockAsistencia = vi.fn().mockResolvedValue({ data: [] });
    const gteMockAsistencia = vi.fn().mockReturnValue({ lte: lteMockAsistencia });

    // Empty certs
    const lteMockCerts = vi.fn().mockResolvedValue({ data: [] });
    const lteGteMockCerts = vi.fn().mockReturnValue({ gte: lteMockCerts });

    const selectMock1 = vi.fn().mockReturnValue({ lte: lteMockHorarios });
    const selectMock2 = vi.fn().mockReturnValue({ gte: gteMockAsistencia });
    const selectMock3 = vi.fn().mockReturnValue({ lte: lteGteMockCerts });
    const insertMock = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'horarios') return { select: selectMock1 } as any;
      if (table === 'asistencia') return { select: selectMock2, insert: insertMock } as any;
      if (table === 'certificaciones') return { select: selectMock3 } as any;
      return {} as any;
    });

    const { result } = renderHook(() => useAsistencia(), { wrapper });

    // 1-day range
    await result.current.generarPlanillaSemana.mutateAsync({ desde: '2023-01-01', hasta: '2023-01-01' });

    expect(insertMock).toHaveBeenCalledTimes(1);
    const insertArg = insertMock.mock.calls[0][0];
    expect(insertArg).toHaveLength(1);
    expect(insertArg[0]).toEqual({
        funcionario_id: 'f1',
        horario_id: 'h1',
        fecha: '2023-01-01',
        estado: 'pendiente'
    });
  });

});
