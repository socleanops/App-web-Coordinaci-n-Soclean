import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useFacturas } from "../../hooks/useFacturas";
import { supabase } from "@/lib/supabase";
import type { FacturaFormData } from "@/lib/validations/facturacion";

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

describe("useFacturas", () => {
  let mockSupabase: Record<string, any> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    mockSupabase = {
      facturas: createChainableMock([]),
      factura_items: createChainableMock([]),
    };

    (supabase.from as Mock).mockImplementation(
      (table: string) => mockSupabase[table] || createChainableMock([]),
    );
  });

  describe("getFacturas", () => {
    it("fetches facturas successfully", async () => {
      const mockData = [{ id: "f1", numero: "101" }];
      mockSupabase.facturas = createChainableMock(mockData);

      const { result } = renderHook(() => useFacturas(), { wrapper });

      await waitFor(() =>
        expect(result.current.getFacturas.isSuccess).toBe(true),
      );

      expect(result.current.getFacturas.data).toEqual(mockData);
    });
  });

  describe("createFactura", () => {
    it("creates a factura and its items successfully", async () => {
      const mockFactura = { id: "f1", numero: "101" };
      mockSupabase.facturas = createChainableMock(mockFactura);
      mockSupabase.factura_items = createChainableMock([]);

      const { result } = renderHook(() => useFacturas(), { wrapper });

      act(() => {
        result.current.createFactura.mutate({
          cliente_id: "c1",
          numero: "101",
          fecha_emision: "2023-10-10",
          estado: "pendiente",
          subtotal: 100,
          impuesto: 22,
          descuento: 0,
          total: 122,
          items: [
            {
              descripcion: "Servicio 1",
              cantidad: 1,
              precio_unitario: 100,
              total: 100,
            },
          ],
        } as unknown as FacturaFormData);
      });

      await waitFor(() =>
        expect(result.current.createFactura.isSuccess).toBe(true),
      );

      expect(result.current.createFactura.data).toEqual(mockFactura);
      expect(mockSupabase.facturas.insert).toHaveBeenCalled();
      expect(mockSupabase.factura_items.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            factura_id: "f1",
            descripcion: "Servicio 1",
          }),
        ]),
      );
    });
  });

  describe("updateFacturaStatus", () => {
    it("updates status successfully", async () => {
      const mockData = { id: "f1", estado: "paga" };
      mockSupabase.facturas = createChainableMock(mockData);

      const { result } = renderHook(() => useFacturas(), { wrapper });

      act(() => {
        result.current.updateFacturaStatus.mutate({ id: "f1", estado: "paga" });
      });

      await waitFor(() =>
        expect(result.current.updateFacturaStatus.isSuccess).toBe(true),
      );

      expect(result.current.updateFacturaStatus.data).toEqual(mockData);
      expect(mockSupabase.facturas.update).toHaveBeenCalledWith(
        expect.objectContaining({ estado: "paga" }),
      );
    });
  });
});
