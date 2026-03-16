import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClienteFormDialog } from '@/components/clientes/ClienteFormDialog';
import { useClientes } from '@/hooks/useClientes';

// Mock the useClientes hook
vi.mock('@/hooks/useClientes', () => ({
    useClientes: vi.fn(),
}));

// Mock sonner to avoid actual toasts
vi.mock('sonner', () => ({
    toast: {
        loading: vi.fn().mockReturnValue('mock-toast-id'),
        success: vi.fn(),
        error: vi.fn(),
        dismiss: vi.fn(),
    },
}));

// ResizeObserver is needed by Radix-UI Dialog
globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};
// Radix-UI PointerEvent polyfill
if (typeof PointerEvent === 'undefined') {
    class PointerEvent extends Event {
        constructor(type: string, props?: EventInit) {
            super(type, props);
        }
    }
    (globalThis as unknown as Record<string, unknown>).PointerEvent = PointerEvent;
}

describe('ClienteFormDialog', () => {
    const mockCreateMutateAsync = vi.fn();
    const mockUpdateMutateAsync = vi.fn();
    const mockOnOpenChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementation
        (useClientes as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            createCliente: { mutateAsync: mockCreateMutateAsync },
            updateCliente: { mutateAsync: mockUpdateMutateAsync },
        });
    });

    it('renders correctly for creating a new client', () => {
        render(
            <ClienteFormDialog open={true} onOpenChange={mockOnOpenChange} />
        );
        expect(screen.getByText('Añadir Nuevo Cliente (Empresa o Persona)')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Guardar Cliente' })).toBeInTheDocument();
    });

    it('renders correctly for editing an existing client', () => {
        const clienteToEdit = {
            id: '123',
            razon_social: 'Empresa Test',
            rut: '12345678',
            direccion: 'Calle Falsa 123',
            estado: 'activo'
        };

        render(
            <ClienteFormDialog open={true} onOpenChange={mockOnOpenChange} clienteToEdit={clienteToEdit} />
        );

        expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Actualizar Cliente' })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Empresa Test')).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty required fields', async () => {
        const user = userEvent.setup();
        render(
            <ClienteFormDialog open={true} onOpenChange={mockOnOpenChange} />
        );

        const submitButton = screen.getByRole('button', { name: 'Guardar Cliente' });
        await user.click(submitButton);

        // Wait for validation errors to appear
        await waitFor(() => {
            expect(screen.getByText('La razón social o nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
            expect(screen.getByText('RUT o Cédula inválida (debe tener entre 8 y 12 números)')).toBeInTheDocument();
            expect(screen.getByText('Especifique la dirección del cliente')).toBeInTheDocument();
        });

        // Mutations should not be called
        expect(mockCreateMutateAsync).not.toHaveBeenCalled();
    });

    it('submits form successfully when creating a new client', async () => {
        mockCreateMutateAsync.mockResolvedValueOnce({ id: 'new-id' });

        const user = userEvent.setup();
        render(
            <ClienteFormDialog open={true} onOpenChange={mockOnOpenChange} />
        );

        // Fill required fields
        await user.type(screen.getByLabelText(/Razón Social \/ Nombre/i), 'Nueva Empresa');
        await user.type(screen.getByLabelText(/RUT \/ Cédula/i), '12345678');
        await user.type(screen.getByLabelText(/Dirección Principal/i), 'Av Central 456');

        // Submit form
        const submitButton = screen.getByRole('button', { name: 'Guardar Cliente' });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockCreateMutateAsync).toHaveBeenCalledWith({
                razon_social: 'Nueva Empresa',
                nombre_fantasia: '',
                rut: '12345678',
                direccion: 'Av Central 456',
                telefono: '',
                email: '',
                contacto_principal: '',
                frecuencia_visita: '',
                carga_horaria: '',
                estado: 'activo',
            });
            expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        });
    });

    it('submits form successfully when updating an existing client', async () => {
        mockUpdateMutateAsync.mockResolvedValueOnce({ id: '123' });

        const clienteToEdit = {
            id: '123',
            razon_social: 'Empresa Test',
            rut: '12345678',
            direccion: 'Calle Falsa 123',
            estado: 'activo'
        };

        const user = userEvent.setup();
        render(
            <ClienteFormDialog open={true} onOpenChange={mockOnOpenChange} clienteToEdit={clienteToEdit} />
        );

        // Modify a field
        const rutInput = screen.getByLabelText(/RUT \/ Cédula/i);
        await user.clear(rutInput);
        await user.type(rutInput, '87654321');

        // Submit form
        const submitButton = screen.getByRole('button', { name: 'Actualizar Cliente' });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
                id: '123',
                data: {
                    id: '123',
                    razon_social: 'Empresa Test',
                    nombre_fantasia: '',
                    rut: '87654321',
                    direccion: 'Calle Falsa 123',
                    telefono: '',
                    email: '',
                    contacto_principal: '',
                    frecuencia_visita: '',
                    carga_horaria: '',
                    estado: 'activo',
                }
            });
            expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        });
    });

    it('handles submission error when creating a new client', async () => {
        const errorMessage = 'Error de red';
        mockCreateMutateAsync.mockRejectedValueOnce(new Error(errorMessage));

        const user = userEvent.setup();
        render(<ClienteFormDialog open={true} onOpenChange={mockOnOpenChange} />);

        // Fill required fields
        await user.type(screen.getByLabelText(/Razón Social \/ Nombre/i), 'Nueva Empresa');
        await user.type(screen.getByLabelText(/RUT \/ Cédula/i), '12345678');
        await user.type(screen.getByLabelText(/Dirección Principal/i), 'Av Central 456');

        const submitButton = screen.getByRole('button', { name: 'Guardar Cliente' });
        await user.click(submitButton);

        await waitFor(async () => {
            expect(mockCreateMutateAsync).toHaveBeenCalled();
            expect(vi.mocked((await import('sonner')).toast.error)).toHaveBeenCalledWith(
                expect.stringContaining('Error de red'),
                expect.any(Object)
            );
        });
    });

    it('handles submission error when updating an existing client', async () => {
        const errorMessage = 'Error al actualizar';
        mockUpdateMutateAsync.mockRejectedValueOnce(new Error(errorMessage));

        const clienteToEdit = {
            id: '123',
            razon_social: 'Empresa Test',
            rut: '12345678',
            direccion: 'Calle Falsa 123',
            estado: 'activo'
        };

        const user = userEvent.setup();
        render(<ClienteFormDialog open={true} onOpenChange={mockOnOpenChange} clienteToEdit={clienteToEdit} />);

        const submitButton = screen.getByRole('button', { name: 'Actualizar Cliente' });
        await user.click(submitButton);

        await waitFor(async () => {
            expect(mockUpdateMutateAsync).toHaveBeenCalled();
            expect(vi.mocked((await import('sonner')).toast.error)).toHaveBeenCalledWith(
                expect.stringContaining('Error al actualizar'),
                expect.any(Object)
            );
        });
    });
});
