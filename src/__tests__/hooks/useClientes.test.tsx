import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClientes } from '@/hooks/useClientes';
import { supabase } from '@/lib/supabase';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useClientes', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('debería fetchear y devolver los clientes correctamente', async () => {
    const mockClientes = [
      { id: '1', razon_social: 'Cliente A', nombre: 'Cliente A' },
      { id: '2', razon_social: 'Cliente B', nombre: 'Cliente B' },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockClientes, error: null });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
    });

    const { result } = renderHook(() => useClientes(), { wrapper });

    await waitFor(() => expect(result.current.getClientes.isSuccess).toBe(true));

    expect(result.current.getClientes.data).toEqual(mockClientes);
    expect(supabase.from).toHaveBeenCalledWith('clientes');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('razon_social', { ascending: true });
  });

  it('debería manejar errores al fetchear los clientes', async () => {
    const errorMessage = 'Error al cargar clientes';

    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: errorMessage } });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
    });

    const { result } = renderHook(() => useClientes(), { wrapper });

    await waitFor(() => expect(result.current.getClientes.isError).toBe(true));

    expect(result.current.getClientes.error?.message).toBe(errorMessage);
  });

  it('debería crear un cliente exitosamente', async () => {
    const newCliente = { id: '3', razon_social: 'Cliente C', nombre: 'Cliente C', ruc: '123' };
    const formData = { razon_social: 'Cliente C', ruc: '123' };

    const mockInsert = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({ data: newCliente, error: null });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    });

    const { result } = renderHook(() => useClientes(), { wrapper });

    // @ts-expect-error bypass exact type checking for tests
    result.current.createCliente.mutate(formData);

    await waitFor(() => expect(result.current.createCliente.isSuccess).toBe(true));

    expect(result.current.createCliente.data).toEqual(newCliente);
    expect(supabase.from).toHaveBeenCalledWith('clientes');
    expect(mockInsert).toHaveBeenCalledWith({ ...formData, nombre: 'Cliente C' });
  });

  it('debería manejar errores al crear un cliente', async () => {
    const formData = { razon_social: 'Cliente D', ruc: '123' };
    const errorMessage = 'Error al crear cliente';

    const mockInsert = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: errorMessage } });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    });

    const { result } = renderHook(() => useClientes(), { wrapper });

    // @ts-expect-error bypass exact type checking for tests
    result.current.createCliente.mutate(formData);

    await waitFor(() => expect(result.current.createCliente.isError).toBe(true));

    expect(result.current.createCliente.error?.message).toBe(errorMessage);
  });

  it('debería actualizar un cliente exitosamente', async () => {
    const updatedCliente = { id: '1', razon_social: 'Cliente A Modificado', nombre: 'Cliente A Modificado' };
    const updateData = { razon_social: 'Cliente A Modificado' };

    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({ data: updatedCliente, error: null });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    });

    const { result } = renderHook(() => useClientes(), { wrapper });

    result.current.updateCliente.mutate({ id: '1', data: updateData });

    await waitFor(() => expect(result.current.updateCliente.isSuccess).toBe(true));

    expect(result.current.updateCliente.data).toEqual(updatedCliente);
    expect(supabase.from).toHaveBeenCalledWith('clientes');
    expect(mockUpdate).toHaveBeenCalledWith({ ...updateData, nombre: 'Cliente A Modificado' });
    expect(mockEq).toHaveBeenCalledWith('id', '1');
  });

  it('debería manejar errores al actualizar un cliente', async () => {
    const updateData = { razon_social: 'Cliente A Modificado' };
    const errorMessage = 'Error al actualizar cliente';

    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSelect = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: errorMessage } });

    (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    });

    const { result } = renderHook(() => useClientes(), { wrapper });

    result.current.updateCliente.mutate({ id: '1', data: updateData });

    await waitFor(() => expect(result.current.updateCliente.isError).toBe(true));

    expect(result.current.updateCliente.error?.message).toBe(errorMessage);
  });
});
