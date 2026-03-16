import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHorarios } from '../../hooks/useHorarios';
import { supabase } from '../../lib/supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useHorarios', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('checkOverlap logic', () => {
        it('should throw an error when overlapping schedules are found', async () => {
            // Mock existing schedules
            const mockExistingSchedules = [
                { id: '1', hora_entrada: '09:00', hora_salida: '17:00' }
            ];

            const selectMock = vi.fn().mockReturnThis();
            const eqMock = vi.fn().mockReturnThis();
            const isMock = vi.fn().mockResolvedValue({ data: mockExistingSchedules, error: null });

            (supabase.from as any).mockReturnValue({
                select: selectMock,
                eq: eqMock,
                is: isMock,
                insert: vi.fn().mockReturnThis(),
            });

            const { result } = renderHook(() => useHorarios(), { wrapper });

            const newSchedule = {
                funcionario_id: 'func-1',
                dia_semana: 1, // Lunes
                hora_entrada: '10:00',
                hora_salida: '18:00',
                servicio_id: 'serv-1',
                fecha_inicio: '2023-01-01'
            };

            await expect(result.current.createHorario.mutateAsync(newSchedule)).rejects.toThrow(
                /Conflicto: Este funcionario ya tiene un horario el Lunes de 09:00 a 17:00 que se superpone con 10:00-18:00/
            );
        });

        it('should throw an error when exact same schedules are found', async () => {
            // Mock existing schedules
            const mockExistingSchedules = [
                { id: '1', hora_entrada: '09:00', hora_salida: '17:00' }
            ];

            const selectMock = vi.fn().mockReturnThis();
            const eqMock = vi.fn().mockReturnThis();
            const isMock = vi.fn().mockResolvedValue({ data: mockExistingSchedules, error: null });

            (supabase.from as any).mockReturnValue({
                select: selectMock,
                eq: eqMock,
                is: isMock,
                insert: vi.fn().mockReturnThis(),
            });

            const { result } = renderHook(() => useHorarios(), { wrapper });

            const newSchedule = {
                funcionario_id: 'func-1',
                dia_semana: 1, // Lunes
                hora_entrada: '09:00',
                hora_salida: '17:00',
                servicio_id: 'serv-1',
                fecha_inicio: '2023-01-01'
            };

            await expect(result.current.createHorario.mutateAsync(newSchedule)).rejects.toThrow(
                /Conflicto: Este funcionario ya tiene un horario el Lunes de 09:00 a 17:00 que se superpone con 09:00-17:00/
            );
        });

        it('should not throw an error when schedules are adjacent but not overlapping', async () => {
            // Mock existing schedules (no overlap)
            const mockExistingSchedules = [
                { id: '1', hora_entrada: '09:00', hora_salida: '12:00' }
            ];

            const mockReturnData = { id: 'new-1' };

            const queryChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                is: vi.fn().mockResolvedValue({ data: mockExistingSchedules, error: null }),
                insert: vi.fn().mockReturnThis(),
            };

            const insertChain = {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockReturnData, error: null })
            }

            queryChain.insert.mockReturnValue(insertChain);

            (supabase.from as any).mockReturnValue(queryChain);

            const { result } = renderHook(() => useHorarios(), { wrapper });

            const newSchedule = {
                funcionario_id: 'func-1',
                dia_semana: 1, // Lunes
                hora_entrada: '12:00',
                hora_salida: '18:00',
                servicio_id: 'serv-1',
                fecha_inicio: '2023-01-01'
            };

            await expect(result.current.createHorario.mutateAsync(newSchedule)).resolves.toEqual(mockReturnData);
        });

        it('should not throw an error when schedules are adjacent (before) but not overlapping', async () => {
            // Mock existing schedules (no overlap)
            const mockExistingSchedules = [
                { id: '1', hora_entrada: '12:00', hora_salida: '18:00' }
            ];

            const mockReturnData = { id: 'new-1' };

            const queryChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                is: vi.fn().mockResolvedValue({ data: mockExistingSchedules, error: null }),
                insert: vi.fn().mockReturnThis(),
            };

            const insertChain = {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockReturnData, error: null })
            }

            queryChain.insert.mockReturnValue(insertChain);

            (supabase.from as any).mockReturnValue(queryChain);

            const { result } = renderHook(() => useHorarios(), { wrapper });

            const newSchedule = {
                funcionario_id: 'func-1',
                dia_semana: 1, // Lunes
                hora_entrada: '09:00',
                hora_salida: '12:00',
                servicio_id: 'serv-1',
                fecha_inicio: '2023-01-01'
            };

            await expect(result.current.createHorario.mutateAsync(newSchedule)).resolves.toEqual(mockReturnData);
        });

        it('should not check overlap with itself when updating', async () => {
            const mockExistingSchedules = [
                { id: '1', hora_entrada: '09:00', hora_salida: '17:00' }
            ];

            const mockReturnData = { id: '1', hora_entrada: '10:00', hora_salida: '18:00' };

            const queryChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                is: vi.fn().mockReturnThis(),
                neq: vi.fn().mockResolvedValue({ data: [], error: null }), // Mock excludeId behavior: no other schedules
                update: vi.fn().mockReturnThis(),
            };

            const updateChain = {
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockReturnData, error: null })
            }

            queryChain.update.mockReturnValue(updateChain);

            (supabase.from as any).mockReturnValue(queryChain);

            const { result } = renderHook(() => useHorarios(), { wrapper });

            const updateData = {
                id: '1',
                data: {
                    funcionario_id: 'func-1',
                    dia_semana: 1,
                    hora_entrada: '10:00',
                    hora_salida: '18:00',
                }
            };

            await expect(result.current.updateHorario.mutateAsync(updateData)).resolves.toEqual(mockReturnData);
        });

        it('should throw an error on update when overlapping with other schedules', async () => {
            const mockExistingSchedules = [
                { id: '2', hora_entrada: '11:00', hora_salida: '15:00' }
            ];

            const mockReturnData = { id: '1', hora_entrada: '10:00', hora_salida: '18:00' };

            const queryChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                is: vi.fn().mockReturnThis(),
                neq: vi.fn().mockResolvedValue({ data: mockExistingSchedules, error: null }), // Overlapping schedule exists
                update: vi.fn().mockReturnThis(),
            };

            const updateChain = {
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockReturnData, error: null })
            }

            queryChain.update.mockReturnValue(updateChain);

            (supabase.from as any).mockReturnValue(queryChain);

            const { result } = renderHook(() => useHorarios(), { wrapper });

            const updateData = {
                id: '1',
                data: {
                    funcionario_id: 'func-1',
                    dia_semana: 1,
                    hora_entrada: '10:00',
                    hora_salida: '18:00',
                }
            };

            await expect(result.current.updateHorario.mutateAsync(updateData)).rejects.toThrow(
                /Conflicto: Este funcionario ya tiene un horario el Lunes de 11:00 a 15:00 que se superpone con 10:00-18:00/
            );
        });

        it('should handle Supabase query errors during checkOverlap', async () => {
            const queryChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                is: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
            };

            (supabase.from as any).mockReturnValue(queryChain);

            const { result } = renderHook(() => useHorarios(), { wrapper });

            const newSchedule = {
                funcionario_id: 'func-1',
                dia_semana: 1,
                hora_entrada: '10:00',
                hora_salida: '18:00',
                servicio_id: 'serv-1',
                fecha_inicio: '2023-01-01'
            };

            await expect(result.current.createHorario.mutateAsync(newSchedule)).rejects.toThrow('Database error');
        });
    });
});
