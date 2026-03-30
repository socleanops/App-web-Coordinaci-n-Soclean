import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Attendance from '../../pages/Attendance';
import { useAsistencia } from '@/hooks/useAsistencia';

// Mock the hook
vi.mock('@/hooks/useAsistencia', () => ({
    useAsistencia: vi.fn(),
}));

describe('Attendance Page', () => {
    it('should display empty state when there are no attendance records', () => {
        // Setup the mock to return empty data and not loading
        vi.mocked(useAsistencia).mockReturnValue({
            getAsistencias: {
                data: [],
                isLoading: false,
                refetch: vi.fn(),
            },
            updateAsistencia: {
                mutateAsync: vi.fn(),
            },
            generarPlanillaDia: {
                mutateAsync: vi.fn(),
            },
            generarPlanillaSemana: {
                mutateAsync: vi.fn(),
            },
            createAsistencia: {
                mutateAsync: vi.fn(),
            },
            deleteAsistencia: {
                mutateAsync: vi.fn(),
            }
        } as any);

        render(<Attendance />);

        // The text expected in the empty state
        expect(screen.getByText('No hay turnos registrados para este período')).toBeInTheDocument();
        expect(screen.getByText('Genera la planilla para volcar los horarios teóricos correspondientes.')).toBeInTheDocument();
    });
});
