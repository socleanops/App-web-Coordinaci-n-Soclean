import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useCertificaciones } from "../../hooks/useCertificaciones";
import { supabase } from "@/lib/supabase";
import type { CertificacionFormData } from "@/lib/validations/certificacion";

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
    delete: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    gte: vi.fn(() => chainable),
    lte: vi.fn(() => chainable),
    in: vi.fn(() => chainable),
    single: vi.fn(() => Promise.resolve({ data: resolvedData, error: null })),
    then: vi.fn((resolve) => resolve({ data: resolvedData, error: null })),
  };
  return chainable;
};

describe("useCertificaciones", () => {
  let mockSupabase: Record<string, Record<string, unknown>> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    mockSupabase = {
      certificaciones: createChainableMock([]),
      asistencia: createChainableMock([]),
    };

    (supabase.from as Mock).mockImplementation(
      (table: string) => mockSupabase[table] || createChainableMock([]),
    );
  });

  describe("getCertificaciones", () => {
    it("fetches certificaciones successfully for a funcionario", async () => {
      const mockData = [{ id: "c1", funcionario_id: "f1" }];
      mockSupabase.certificaciones = createChainableMock(mockData);

      const { result } = renderHook(() => useCertificaciones("f1"), { wrapper });

      await waitFor(() =>
        expect(result.current.getCertificaciones.isSuccess).toBe(true),
      );

      expect(result.current.getCertificaciones.data).toEqual(mockData);
      expect(mockSupabase.certificaciones.eq).toHaveBeenCalledWith("funcionario_id", "f1");
    });
  });

  describe("createCertificacion", () => {
    it("creates a certificacion and updates overlapping attendance correctly", async () => {
      const mockCert = { id: "c1", funcionario_id: "f1" };
      mockSupabase.certificaciones = createChainableMock(mockCert);
      mockSupabase.asistencia = createChainableMock([]);

      const { result } = renderHook(() => useCertificaciones(), { wrapper });

      act(() => {
        result.current.createCertificacion.mutate({
          funcionario_id: "f1",
          fecha_inicio: "2023-10-01",
          fecha_fin: "2023-10-10",
          motivo: "Fiebre",
        } as unknown as CertificacionFormData);
      });

      await waitFor(() =>
        expect(result.current.createCertificacion.isSuccess).toBe(true),
      );

      expect(result.current.createCertificacion.data).toEqual(mockCert);
      expect(mockSupabase.certificaciones.insert).toHaveBeenCalled();
      
      // Verify attendance update
      expect(mockSupabase.asistencia.update).toHaveBeenCalledWith({ estado: "certificado" });
      expect(mockSupabase.asistencia.eq).toHaveBeenCalledWith("funcionario_id", "f1");
      expect(mockSupabase.asistencia.gte).toHaveBeenCalledWith("fecha", "2023-10-01");
      expect(mockSupabase.asistencia.lte).toHaveBeenCalledWith("fecha", "2023-10-10");
    });
  });

  describe("deleteCertificacion", () => {
      it("deletes a certificacion successfully", async () => {
          mockSupabase.certificaciones = createChainableMock();
          const { result } = renderHook(() => useCertificaciones(), { wrapper });

          act(() => {
              result.current.deleteCertificacion.mutate("c1");
          });

          await waitFor(() => expect(result.current.deleteCertificacion.isSuccess).toBe(true));
          expect(mockSupabase.certificaciones.delete).toHaveBeenCalled();
          expect(mockSupabase.certificaciones.eq).toHaveBeenCalledWith("id", "c1");
      });
  });
});
