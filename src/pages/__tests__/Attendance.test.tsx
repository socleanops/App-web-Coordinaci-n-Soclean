import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Attendance from '../Attendance';
import { useAsistencia } from '@/hooks/useAsistencia';

// Mock the hook
vi.mock('@/hooks/useAsistencia');

describe('Attendance Component', () => {
    it('renders empty state when there are no attendance records', () => {
        // Setup the mock to return an empty array and not loading
        vi.mocked(useAsistencia).mockReturnValue({
            getAsistencias: {
                data: [],
                isLoading: false,
                refetch: vi.fn(),
            } as any,
            createAsistencia: {} as any,
            updateAsistencia: {
                mutateAsync: vi.fn(),
            } as any,
            generarPlanillaDia: {
                mutateAsync: vi.fn(),
                isPending: false,
            } as any,
        });

        render(<Attendance />);

        // Assert that the empty state text is present
        expect(screen.getByText('No hay turnos registrados para la fecha seleccionada')).toBeInTheDocument();
        expect(screen.getByText('Genera la planilla para volcar los horarios teóricos correspondientes a este día y poder chequearlos.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Generar Planilla del Día' })).toBeInTheDocument();
    });
});
