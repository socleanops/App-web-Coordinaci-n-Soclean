import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Attendance from '@/pages/Attendance';
import { useAsistencia } from '@/hooks/useAsistencia';
import { toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencias
vi.mock('@/hooks/useAsistencia', () => ({
  useAsistencia: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Setup de QueryClient para el test
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Attendance Component - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar un toast de error cuando falla la actualización del estado (handleActualizarEstado)', async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Error de conexión a la base de datos'));

    // Mockeamos el hook para que devuelva un estado específico y nuestra función que falla
    (useAsistencia as any).mockReturnValue({
      getAsistencias: {
        data: [{
          id: 'test-id-123',
          funcionario_id: 'func-456',
          estado: 'pendiente',
          observaciones: '',
          funcionarios: {
            profiles: {
              nombre: 'Juan',
              apellido: 'Pérez',
            },
          },
          horarios: {
            hora_entrada: '08:00:00',
            hora_salida: '16:00:00',
            servicios: {
              nombre: 'Servicio de prueba',
              clientes: {
                razon_social: 'Empresa Test SA',
              },
            },
          },
        }],
        isLoading: false,
        refetch: vi.fn(),
      },
      updateAsistencia: {
        mutateAsync: mockMutateAsync,
        isPending: false,
      },
      generarPlanillaDia: {
        mutateAsync: vi.fn(),
        isPending: false,
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Attendance />
      </QueryClientProvider>
    );

    // Verificamos que se renderice el empleado en la tabla
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();

    // Buscamos el trigger del Select
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    // Seleccionamos "Presente"
    const presenteOption = screen.getByText('Presente');
    fireEvent.click(presenteOption);

    // Verificamos que se haya llamado a la función de mutación con el argumento correcto
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'test-id-123',
        data: { estado: 'presente' },
      });
    });

    // Verificamos que se haya mostrado el toast de error con el mensaje correcto
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error de conexión a la base de datos');
    });
  });

  it('debe mostrar un mensaje por defecto cuando el error no tiene mensaje', async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue({});

    // Mockeamos el hook para que devuelva un estado específico y nuestra función que falla
    (useAsistencia as any).mockReturnValue({
      getAsistencias: {
        data: [{
          id: 'test-id-123',
          funcionario_id: 'func-456',
          estado: 'pendiente',
          observaciones: '',
          funcionarios: {
            profiles: {
              nombre: 'Juan',
              apellido: 'Pérez',
            },
          },
          horarios: {
            hora_entrada: '08:00:00',
            hora_salida: '16:00:00',
            servicios: {
              nombre: 'Servicio de prueba',
              clientes: {
                razon_social: 'Empresa Test SA',
              },
            },
          },
        }],
        isLoading: false,
        refetch: vi.fn(),
      },
      updateAsistencia: {
        mutateAsync: mockMutateAsync,
        isPending: false,
      },
      generarPlanillaDia: {
        mutateAsync: vi.fn(),
        isPending: false,
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Attendance />
      </QueryClientProvider>
    );

    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    const presenteOption = screen.getByText('Presente');
    fireEvent.click(presenteOption);

    // Verificamos que se haya mostrado el toast de error con el mensaje por defecto
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No se pudo actualizar el estado de asistencia');
    });
  });
});
