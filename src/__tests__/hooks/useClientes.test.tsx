import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useClientes } from "../../hooks/useClientes";
import { supabase } from "@/lib/supabase";
import type { ClienteFormData } from "@/lib/validations/cliente";

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
    eq: vi.fn(() => chainable),
    single: vi.fn(() => Promise.resolve({ data: resolvedData, error: null })),
    then: vi.fn((resolve) => resolve({ data: resolvedData, error: null })),
  };
  return chainable;
};

describe("useClientes", () => {
  let mockSupabase: Record<string, Record<string, any>> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    mockSupabase = {
      clientes: createChainableMock([]),
    };

    (supabase.from as Mock).mockImplementation(
      (table: string) => mockSupabase[table] || createChainableMock([]),
    );
  });

  describe("getClientes", () => {
    it("fetches clientes successfully", async () => {
      const mockData = [{ id: "1", razon_social: "Cliente 1" }];
      mockSupabase.clientes = createChainableMock(mockData);

      const { result } = renderHook(() => useClientes(), { wrapper });

      await waitFor(() =>
        expect(result.current.getClientes.isSuccess).toBe(true),
      );

      expect(result.current.getClientes.data).toEqual(mockData);
      expect(mockSupabase.clientes.select).toHaveBeenCalled();
      expect(mockSupabase.clientes.order).toHaveBeenCalledWith("razon_social", {
        ascending: true,
      });
    });

    it("throws error when fetching fails", async () => {
      const builder = createChainableMock();
      builder.then = vi.fn((resolve) =>
        resolve({ data: null, error: { message: "Fetch error" } }),
      );
      mockSupabase.clientes = builder;

      const { result } = renderHook(() => useClientes(), { wrapper });

      await waitFor(() =>
        expect(result.current.getClientes.isError).toBe(true),
      );
      expect(result.current.getClientes.error?.message).toBe("Fetch error");
    });
  });

  describe("createCliente", () => {
    it("creates cliente successfully with injected nombre based on razon_social", async () => {
      const mockData = {
        id: "1",
        razon_social: "Cliente 1",
        nombre: "Cliente 1",
      };
      mockSupabase.clientes = createChainableMock(mockData);

      const { result } = renderHook(() => useClientes(), { wrapper });

      act(() => {
        result.current.createCliente.mutate({
          razon_social: "Cliente 1",
          rut: "123456789012",
          frecuencia_visita: "semana",
          carga_horaria: 10,
          estado: "activo",
        } as unknown as ClienteFormData);
      });

      await waitFor(() =>
        expect(result.current.createCliente.isSuccess).toBe(true),
      );

      expect(result.current.createCliente.data).toEqual(mockData);
      expect(mockSupabase.clientes.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          razon_social: "Cliente 1",
          nombre: "Cliente 1",
        }),
      );
    });
  });

  describe("updateCliente", () => {
    it("updates cliente successfully and overrides nombre if razon_social changes", async () => {
      const mockData = {
        id: "1",
        razon_social: "Cliente Updated",
        nombre: "Cliente Updated",
      };
      mockSupabase.clientes = createChainableMock(mockData);

      const { result } = renderHook(() => useClientes(), { wrapper });

      act(() => {
        result.current.updateCliente.mutate({
          id: "1",
          data: { razon_social: "Cliente Updated" },
        });
      });

      await waitFor(() =>
        expect(result.current.updateCliente.isSuccess).toBe(true),
      );

      expect(result.current.updateCliente.data).toEqual(mockData);
      expect(mockSupabase.clientes.update).toHaveBeenCalledWith(
        expect.objectContaining({
          razon_social: "Cliente Updated",
          nombre: "Cliente Updated",
        }),
      );
      expect(mockSupabase.clientes.eq).toHaveBeenCalledWith("id", "1");
    });
  });
});
