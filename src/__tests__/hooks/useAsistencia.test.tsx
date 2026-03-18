import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useAsistencia } from "../../hooks/useAsistencia";
import { supabase } from "@/lib/supabase";

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
  const chainable: Record<string, unknown> = {
    select: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    gte: vi.fn(() => chainable),
    lte: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    or: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
    single: vi.fn(() => Promise.resolve({ data: resolvedData, error: null })),
    then: vi.fn((resolve) => resolve({ data: resolvedData, error: null })),
  };
  return chainable;
};

describe("useAsistencia", () => {
  let mockSupabase: Record<string, Record<string, any>> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    mockSupabase = {
      asistencia: createChainableMock([]),
      horarios: createChainableMock([]),
      certificaciones: createChainableMock([]),
    };

    (supabase.from as Mock).mockImplementation(
      (table: string) => mockSupabase[table] || createChainableMock([]),
    );
  });

  describe("getAsistencias", () => {
    it("fetches asistencias successfully without dates", async () => {
      const mockData = [{ id: "1", funcionario_id: "f1" }];
      mockSupabase.asistencia = createChainableMock(mockData);

      const { result } = renderHook(() => useAsistencia(), { wrapper });

      await waitFor(() =>
        expect(result.current.getAsistencias.isSuccess).toBe(true),
      );

      expect(result.current.getAsistencias.data).toEqual(mockData);
      expect(mockSupabase.asistencia.order).toHaveBeenCalledWith("fecha", {
        ascending: true,
      });
    });

    it("fetches asistencias with date range", async () => {
      const mockData = [{ id: "2" }];
      mockSupabase.asistencia = createChainableMock(mockData);

      const { result } = renderHook(
        () => useAsistencia("2023-01-01", "2023-01-31"),
        { wrapper },
      );

      await waitFor(() =>
        expect(result.current.getAsistencias.isSuccess).toBe(true),
      );

      expect(result.current.getAsistencias.data).toEqual(mockData);
      expect(mockSupabase.asistencia.gte).toHaveBeenCalledWith(
        "fecha",
        "2023-01-01",
      );
      expect(mockSupabase.asistencia.lte).toHaveBeenCalledWith(
        "fecha",
        "2023-01-31",
      );
    });

    it("throws error when fetching fails", async () => {
      const builder = createChainableMock();
      builder.then = vi.fn((resolve) =>
        resolve({ data: null, error: { message: "Fetch error" } }),
      );
      mockSupabase.asistencia = builder;

      const { result } = renderHook(() => useAsistencia(), { wrapper });

      await waitFor(() =>
        expect(result.current.getAsistencias.isError).toBe(true),
      );
      expect(result.current.getAsistencias.error?.message).toBe("Fetch error");
    });
  });

  describe("createAsistencia", () => {
    it("creates asistencia successfully", async () => {
      const mockData = { id: "1", funcionario_id: "f1" };
      mockSupabase.asistencia = createChainableMock(mockData);

      const { result } = renderHook(() => useAsistencia(), { wrapper });

      act(() => {
        result.current.createAsistencia.mutate({
          funcionario_id: "f1",
          horario_id: "h1",
          fecha: "2023-10-10",
          estado: "pendiente",
        } as any);
      });

      await waitFor(() =>
        expect(result.current.createAsistencia.isSuccess).toBe(true),
      );

      expect(result.current.createAsistencia.data).toEqual(mockData);
      expect(mockSupabase.asistencia.insert).toHaveBeenCalledWith({
        funcionario_id: "f1",
        horario_id: "h1",
        fecha: "2023-10-10",
        estado: "pendiente",
      });
    });
  });

  describe("updateAsistencia", () => {
    it("updates asistencia successfully", async () => {
      const mockData = { id: "1", estado: "presente" };
      mockSupabase.asistencia = createChainableMock(mockData);

      const { result } = renderHook(() => useAsistencia(), { wrapper });

      act(() => {
        result.current.updateAsistencia.mutate({
          id: "1",
          data: { estado: "presente" },
        });
      });

      await waitFor(() =>
        expect(result.current.updateAsistencia.isSuccess).toBe(true),
      );

      expect(result.current.updateAsistencia.data).toEqual(mockData);
      expect(mockSupabase.asistencia.update).toHaveBeenCalledWith({
        estado: "presente",
      });
      expect(mockSupabase.asistencia.eq).toHaveBeenCalledWith("id", "1");
    });
  });

  describe("generarPlanillaDia", () => {
    it("generates attendance successfully considering certifications", async () => {
      mockSupabase.horarios = createChainableMock([
        {
          id: "h1",
          funcionario_id: "f1",
          vigente_desde: "2023-01-01",
          vigente_hasta: null,
        },
      ]);
      mockSupabase.asistencia = createChainableMock([]);
      mockSupabase.certificaciones = createChainableMock([
        { funcionario_id: "f1" },
      ]);

      const insertMock = vi.fn(() => mockSupabase.asistencia);
      mockSupabase.asistencia.insert = insertMock;

      const { result } = renderHook(() => useAsistencia(), { wrapper });

      act(() => {
        result.current.generarPlanillaDia.mutate("2023-10-10");
      });

      await waitFor(() =>
        expect(result.current.generarPlanillaDia.isSuccess).toBe(true),
      );

      expect(result.current.generarPlanillaDia.data).toEqual({ count: 1 });
      expect(insertMock).toHaveBeenCalledWith([
        {
          funcionario_id: "f1",
          horario_id: "h1",
          fecha: "2023-10-10",
          estado: "certificado",
        },
      ]);
    });

    it("handles no new records", async () => {
      mockSupabase.horarios = createChainableMock([
        {
          id: "h1",
          funcionario_id: "f1",
          vigente_desde: "2023-01-01",
          vigente_hasta: null,
        },
      ]);
      mockSupabase.asistencia = createChainableMock([{ horario_id: "h1" }]);

      const insertMock = vi.fn(() => mockSupabase.asistencia);
      mockSupabase.asistencia.insert = insertMock;

      const { result } = renderHook(() => useAsistencia(), { wrapper });

      act(() => {
        result.current.generarPlanillaDia.mutate("2023-10-10");
      });

      await waitFor(() =>
        expect(result.current.generarPlanillaDia.isSuccess).toBe(true),
      );

      expect(result.current.generarPlanillaDia.data).toEqual({ count: 0 });
      expect(insertMock).not.toHaveBeenCalled();
    });
  });

  describe("generarPlanillaSemana", () => {
    it("generates weekly attendance successfully", async () => {
      mockSupabase.horarios = createChainableMock([
        {
          id: "h1",
          funcionario_id: "f1",
          dia_semana: 2,
          vigente_desde: "2023-01-01",
          vigente_hasta: null,
        },
        {
          id: "h2",
          funcionario_id: "f2",
          dia_semana: 3,
          vigente_desde: "2023-01-01",
          vigente_hasta: null,
        },
      ]);

      mockSupabase.asistencia = createChainableMock([
        { horario_id: "h2", fecha: "2023-10-11" },
      ]);

      mockSupabase.certificaciones = createChainableMock([
        {
          funcionario_id: "f1",
          fecha_inicio: "2023-10-01",
          fecha_fin: "2023-10-20",
        },
      ]);

      const insertMock = vi.fn(() => mockSupabase.asistencia);
      mockSupabase.asistencia.insert = insertMock;

      const { result } = renderHook(() => useAsistencia(), { wrapper });

      act(() => {
        // 2023-10-09 is Monday, 2023-10-10 is Tuesday (dia 2) -> matches h1
        // 2023-10-11 is Wednesday (dia 3) -> matches h2, but already exists in asistencia mock
        result.current.generarPlanillaSemana.mutate({
          desde: "2023-10-09",
          hasta: "2023-10-15",
        });
      });

      await waitFor(() =>
        expect(result.current.generarPlanillaSemana.isSuccess).toBe(true),
      );

      expect(result.current.generarPlanillaSemana.data).toEqual({ count: 1 });
      expect(insertMock).toHaveBeenCalledWith([
        {
          funcionario_id: "f1",
          horario_id: "h1",
          fecha: "2023-10-10",
          estado: "certificado",
        },
      ]);
    });
  });
});
