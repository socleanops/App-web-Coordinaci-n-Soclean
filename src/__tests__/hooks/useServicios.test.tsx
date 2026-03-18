import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useServicios } from "../../hooks/useServicios";
import { supabase } from "@/lib/supabase";
import type { ServicioFormData } from "@/lib/validations/servicio";

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
    insert: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    single: vi.fn(() => Promise.resolve({ data: resolvedData, error: null })),
    then: vi.fn((resolve) => resolve({ data: resolvedData, error: null })),
  };
  return chainable;
};

describe("useServicios", () => {
  let mockSupabase: Record<string, Record<string, unknown>> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    mockSupabase = {
      servicios: createChainableMock([]),
    };

    (supabase.from as Mock).mockImplementation(
      (table: string) => mockSupabase[table] || createChainableMock([]),
    );
  });

  describe("getServicios", () => {
    it("fetches servicios successfully", async () => {
      const mockData = [{ id: "1", nombre: "Servicio A" }];
      mockSupabase.servicios = createChainableMock(mockData);

      const { result } = renderHook(() => useServicios(), { wrapper });

      await waitFor(() =>
        expect(result.current.getServicios.isSuccess).toBe(true),
      );

      expect(result.current.getServicios.data).toEqual(mockData);
      expect(mockSupabase.servicios.select).toHaveBeenCalled();
    });
  });

  describe("createServicio", () => {
    it("creates a servicio successfully", async () => {
      const mockData = { id: "1", nombre: "Servicio A" };
      mockSupabase.servicios = createChainableMock(mockData);

      const { result } = renderHook(() => useServicios(), { wrapper });

      act(() => {
        result.current.createServicio.mutate({
          nombre: "Servicio A",
          cliente_id: "c1",
          direccion: "Direccion A",
        } as unknown as ServicioFormData);
      });

      await waitFor(() =>
        expect(result.current.createServicio.isSuccess).toBe(true),
      );

      expect(result.current.createServicio.data).toEqual(mockData);
      expect(mockSupabase.servicios.insert).toHaveBeenCalledWith({
          nombre: "Servicio A",
          cliente_id: "c1",
          direccion: "Direccion A",
      });
    });
  });

  describe("updateServicio", () => {
    it("updates status successfully", async () => {
      const mockData = { id: "1", nombre: "Servicio B" };
      mockSupabase.servicios = createChainableMock(mockData);

      const { result } = renderHook(() => useServicios(), { wrapper });

      act(() => {
        result.current.updateServicio.mutate({
          id: "1",
          data: { nombre: "Servicio B" },
        });
      });

      await waitFor(() =>
        expect(result.current.updateServicio.isSuccess).toBe(true),
      );

      expect(result.current.updateServicio.data).toEqual(mockData);
      expect(mockSupabase.servicios.update).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: "Servicio B" }),
      );
      expect(mockSupabase.servicios.eq).toHaveBeenCalledWith("id", "1");
    });
  });
});
