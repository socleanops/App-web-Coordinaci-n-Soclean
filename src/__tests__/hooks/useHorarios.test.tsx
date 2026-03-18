import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useHorarios } from "../../hooks/useHorarios";
import { supabase } from "@/lib/supabase";
import type { HorarioFormData } from "@/lib/validations/horario";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const createChainableMock = (resolvedData: unknown = null) => {
  const chainable: Record<string, any> = {
    select: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
    delete: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    neq: vi.fn(() => chainable),
    is: vi.fn(() => chainable),
    single: vi.fn(() => Promise.resolve({ data: resolvedData, error: null })),
    then: vi.fn((resolve) => resolve({ data: resolvedData, error: null })),
  };
  return chainable;
};

describe("useHorarios", () => {
  let mockSupabase: Record<string, Record<string, any>> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    mockSupabase = {
      horarios: createChainableMock([]),
    };

    (supabase.from as Mock).mockImplementation(
      (table: string) => mockSupabase[table] || createChainableMock([]),
    );
  });

  describe("getHorarios", () => {
    it("fetches horarios successfully", async () => {
      const mockData = [{ id: "1", dia_semana: 1 }];
      mockSupabase.horarios = createChainableMock(mockData);

      const { result } = renderHook(() => useHorarios(), { wrapper });

      await waitFor(() =>
        expect(result.current.getHorarios.isSuccess).toBe(true),
      );

      expect(result.current.getHorarios.data).toEqual(mockData);
    });
  });

  describe("createHorario", () => {
    it("creates a horario if there is no overlap", async () => {
      const mockData = { id: "1", funcionario_id: "f1", dia_semana: 1 };
      
      // First call to checkOverlap results in empty list (no overlap)
      const fetchBuilder = createChainableMock([]);
      // Second call to insert results in mockData
      const insertBuilder = createChainableMock(mockData);

      (supabase.from as Mock).mockImplementation((table: string) => {
          if (table === 'horarios') {
              // We need to distinguish between the select (overlap check) and the insert
              return {
                  ...createChainableMock([]), // for select
                  insert: vi.fn(() => insertBuilder),
              };
          }
          return createChainableMock([]);
      });

      const { result } = renderHook(() => useHorarios(), { wrapper });

      act(() => {
        result.current.createHorario.mutate({
          funcionario_id: "f1",
          dia_semana: 1,
          hora_entrada: "08:00",
          hora_salida: "12:00",
          servicio_id: "s1",
          vigente_desde: "2023-10-10",
        } as unknown as HorarioFormData);
      });

      await waitFor(() =>
        expect(result.current.createHorario.isSuccess).toBe(true),
      );
      expect(result.current.createHorario.data).toEqual(mockData);
    });

    it("throws error if there is an overlap when creating", async () => {
        const existingSchedules = [
            { id: "ex-1", hora_entrada: "09:00", hora_salida: "11:00" }
        ];
        
        mockSupabase.horarios = createChainableMock(existingSchedules);

        const { result } = renderHook(() => useHorarios(), { wrapper });

        act(() => {
          result.current.createHorario.mutate({
            funcionario_id: "f1",
            dia_semana: 1,
            hora_entrada: "08:00",
            hora_salida: "10:00", // Overlaps with 09:00-11:00
            servicio_id: "s1",
            vigente_desde: "2023-10-10",
          } as unknown as HorarioFormData);
        });

        await waitFor(() =>
          expect(result.current.createHorario.isError).toBe(true),
        );
        expect(result.current.createHorario.error?.message).toContain("Conflicto");
    });
  });

  describe("deleteHorario", () => {
      it("deletes a horario successfully", async () => {
          mockSupabase.horarios = createChainableMock();
          const { result } = renderHook(() => useHorarios(), { wrapper });

          act(() => {
              result.current.deleteHorario.mutate("h1");
          });

          await waitFor(() => expect(result.current.deleteHorario.isSuccess).toBe(true));
          expect(mockSupabase.horarios.delete).toHaveBeenCalled();
          expect(mockSupabase.horarios.eq).toHaveBeenCalledWith("id", "h1");
      });
  });
});
