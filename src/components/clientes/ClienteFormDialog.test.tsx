import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClienteFormDialog } from './ClienteFormDialog';
import { useClientes } from '@/hooks/useClientes';

// Mock the useClientes hook
vi.mock('@/hooks/useClientes', () => ({
    useClientes: vi.fn(),
}));

describe('ClienteFormDialog', () => {
    it('shows validation errors when submitting an empty form', async () => {
        // Setup mock implementation for useClientes
        (useClientes as any).mockReturnValue({
            createCliente: { mutateAsync: vi.fn() },
            updateCliente: { mutateAsync: vi.fn() },
        });

        // Render the component
        render(
            <ClienteFormDialog
                open={true}
                onOpenChange={vi.fn()}
            />
        );

        // Find the submit button and click it
        const submitButton = screen.getByText('Guardar Cliente');
        fireEvent.click(submitButton);

        // Wait for validation messages to appear
        await waitFor(() => {
            expect(screen.getByText('La razón social o nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
            expect(screen.getByText('RUT o Cédula inválida (debe tener entre 8 y 12 números)')).toBeInTheDocument();
            expect(screen.getByText('Especifique la dirección del cliente')).toBeInTheDocument();
        });
    });
});
