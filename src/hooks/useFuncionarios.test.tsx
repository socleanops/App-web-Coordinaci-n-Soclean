import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useFuncionarios } from "./useFuncionarios";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { FuncionarioFormData } from "@/lib/validations/funcionario";

// Mock dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockAuthSignUp = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: mockAuthSignUp,
    },
  })),
}));

vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(() => "toast-id"),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  generateSecureRandomString: vi.fn(() => "123456"),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useFuncionarios", () => {
  let mockTables: Record<string, Record<string, Mock>> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    // Setup default chainable mocks for supabase tables
    mockTables = {
      funcionarios: {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { profile_id: "prof-1" },
              error: null,
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: { id: "func-1" }, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "func-1", cargo: "Manager" },
                error: null,
              }),
            }),
          }),
        }),
      },
      departamentos: {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "dep-1", nombre: "IT" },
              error: null,
            }),
          }),
        }),
      },
      profiles: {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        upsert: vi.fn().mockResolvedValue({ error: null }),
      },
    };

    (supabase.from as Mock).mockImplementation(
      (table: string) => mockTables[table] || {},
    );
    (supabase.rpc as Mock).mockResolvedValue({ error: null });
  });

  describe("getFuncionarios", () => {
    it("fetches funcionarios successfully", async () => {
      const mockData = [{ id: "1", cedula: "12345678" }];
      mockTables.funcionarios.select = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const { result } = renderHook(() => useFuncionarios(), { wrapper });

      await waitFor(() =>
        expect(result.current.getFuncionarios.isSuccess).toBe(true),
      );

      expect(result.current.getFuncionarios.data).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith("funcionarios");
    });

    it("throws error when fetching funcionarios fails", async () => {
      mockTables.funcionarios.select = vi.fn().mockReturnValue({
        order: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Fetch error") }),
      });

      const { result } = renderHook(() => useFuncionarios(), { wrapper });

      await waitFor(() =>
        expect(result.current.getFuncionarios.isError).toBe(true),
      );
      expect(result.current.getFuncionarios.error?.message).toBe("Fetch error");
    });
  });

  describe("getDepartamentos", () => {
    it("fetches departamentos successfully", async () => {
      const mockData = [{ id: "1", nombre: "HR" }];
      mockTables.departamentos.select = vi
        .fn()
        .mockResolvedValue({ data: mockData, error: null });

      const { result } = renderHook(() => useFuncionarios(), { wrapper });

      await waitFor(() =>
        expect(result.current.getDepartamentos.isSuccess).toBe(true),
      );

      expect(result.current.getDepartamentos.data).toEqual(mockData);
    });
  });

  describe("createDepartamento", () => {
    it("creates a departamento successfully", async () => {
      const mockData = { id: "1", nombre: "IT" };
      mockTables.departamentos.insert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      });

      const { result } = renderHook(() => useFuncionarios(), { wrapper });

      act(() => {
        result.current.createDepartamento.mutate("IT");
      });

      await waitFor(() =>
        expect(result.current.createDepartamento.isSuccess).toBe(true),
      );
      expect(result.current.createDepartamento.data).toEqual(mockData);
      expect(mockTables.departamentos.insert).toHaveBeenCalledWith({
        nombre: "IT",
      });
    });
  });

  describe("updateFuncionario", () => {
    it("updates funcionario and profile correctly", async () => {
      const mockResult = { id: "1", cargo: "Manager" };
      mockTables.funcionarios.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: mockResult, error: null }),
          }),
        }),
      });

      const { result } = renderHook(() => useFuncionarios(), { wrapper });

      act(() => {
        result.current.updateFuncionario.mutate({
          id: "1",
          data: { nombre: "John", cargo: "Manager" },
        });
      });

      await waitFor(() =>
        expect(result.current.updateFuncionario.isSuccess).toBe(true),
      );
      expect(result.current.updateFuncionario.data).toEqual(mockResult);
      expect(mockTables.profiles.update).toHaveBeenCalled();
      expect(mockTables.funcionarios.update).toHaveBeenCalledWith({
        cargo: "Manager",
      }); // Ensure profile fields are deleted from func update
    });
  });

  describe("createFuncionario", () => {
    it("creates a funcionario and auth user when profile does not exist", async () => {
      mockAuthSignUp.mockResolvedValue({
        data: { user: { id: "new-auth-id", identities: [{ id: "i1" }] } },
        error: null,
      });

      const { result } = renderHook(() => useFuncionarios(), { wrapper });

      act(() => {
        result.current.createFuncionario.mutate({
          cedula: "12345678",
          nombre: "Jane",
          apellido: "Doe",
          rol: "empleado",
          cargo: "Cleaner",
          estado: "activo",
          fecha_ingreso: "2026-03-18",
        } as unknown as FuncionarioFormData);
      });

      await waitFor(
        () => expect(result.current.createFuncionario.isSuccess).toBe(true),
        { timeout: 3000 },
      );

      expect(mockAuthSignUp).toHaveBeenCalled();
      expect(mockTables.profiles.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "new-auth-id",
          nombre: "Jane",
          apellido: "Doe",
        }),
        { onConflict: "id" },
      );
      expect(mockTables.funcionarios.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          profile_id: "new-auth-id",
          cedula: "12345678",
        }),
      );
      expect(toast.success).toHaveBeenCalledWith(
        "5/5 Operación exitosa!",
        expect.anything(),
      );
    });
  });

  describe("resetPassword", () => {
    it("resets password successfully via rpc", async () => {
      const { result } = renderHook(() => useFuncionarios(), { wrapper });

      act(() => {
        result.current.resetPassword.mutate({
          profileId: "prof-1",
          newPassword: "new-pass",
        });
      });

      await waitFor(() =>
        expect(result.current.resetPassword.isSuccess).toBe(true),
      );
      expect(supabase.rpc).toHaveBeenCalledWith("reset_user_password", {
        target_user_id: "prof-1",
        new_password: "new-pass",
      });
    });
  });
});
