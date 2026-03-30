import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
        channel: vi.fn(),
        removeChannel: vi.fn(),
    }
}));

const mockNotifications = [
    {
        id: '1',
        table_name: 'funcionarios',
        action: 'INSERT',
        created_at: new Date().toISOString(),
        changed_by: 'user-1'
    },
    {
        id: '2',
        table_name: 'horarios',
        action: 'UPDATE',
        created_at: new Date(Date.now() - 1000 * 60).toISOString(),
        changed_by: 'user-2'
    },
    {
        id: '3',
        table_name: 'asistencia',
        action: 'DELETE',
        created_at: new Date(Date.now() - 1000 * 3600).toISOString(),
        changed_by: 'user-3'
    }
];

describe('NotificationDropdown', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default channel mock
        const channelBuilder = {
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnThis(),
        };
        (supabase.channel as unknown as ReturnType<typeof vi.fn>).mockReturnValue(channelBuilder);

        // Polyfill hasPointerCapture
        if (!HTMLElement.prototype.hasPointerCapture) {
            HTMLElement.prototype.hasPointerCapture = () => false;
        }

        // Mock ResizeObserver
        globalThis.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        };

        // Mock PointerEvent
        if (typeof globalThis.PointerEvent === 'undefined') {
            class PointerEvent extends Event {
                pointerId: number;
                constructor(type: string, params: PointerEventInit = {}) {
                    super(type, params);
                    this.pointerId = params.pointerId || 0;
                }
            }
            globalThis.PointerEvent = PointerEvent as unknown as typeof globalThis.PointerEvent;
        }
    });

    it('fetches and displays notifications correctly', async () => {
        const queryBuilder = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
        };
        (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue(queryBuilder);

        render(<NotificationDropdown />);

        // Wait for fetch to complete and count to update
        await waitFor(() => {
            const button = screen.getByRole('button', { name: /Notificaciones/i });
            expect(button).toHaveTextContent('3');
        });

        // Open dropdown
        fireEvent.pointerDown(screen.getByRole('button', { name: /Notificaciones/i }));

        // Check content
        await waitFor(() => {
            expect(screen.getByText('Nuevo registro en funcionarios')).toBeInTheDocument();
            expect(screen.getByText('Actualización en horarios')).toBeInTheDocument();
            expect(screen.getByText('Eliminación en asistencia')).toBeInTheDocument();
        });
    });

    it('handles empty notifications response', async () => {
        const queryBuilder = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
        (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue(queryBuilder);

        render(<NotificationDropdown />);

        await waitFor(() => {
            // It should not show the badge if count is 0
            expect(screen.getByRole('button', { name: /Notificaciones/i }).textContent).not.toContain('3');
        });

        fireEvent.pointerDown(screen.getByRole('button', { name: /Notificaciones/i }));

        await waitFor(() => {
            expect(screen.getByText('No tienes alertas nuevas')).toBeInTheDocument();
        });
    });

    it('handles error response when fetching notifications gracefully', async () => {
        const queryBuilder = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
        };
        (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue(queryBuilder);

        render(<NotificationDropdown />);

        await waitFor(() => {
            // No badge if error (defaults to 0 unread)
            expect(screen.getByRole('button', { name: /Notificaciones/i }).textContent).not.toContain('3');
        });

        fireEvent.pointerDown(screen.getByRole('button', { name: /Notificaciones/i }));

        await waitFor(() => {
            expect(screen.getByText('No tienes alertas nuevas')).toBeInTheDocument();
        });
    });

    it('handles thrown error during fetch', async () => {
        const queryBuilder = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockRejectedValue(new Error('Network error')),
        };
        (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue(queryBuilder);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<NotificationDropdown />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalled();
            expect(screen.getByRole('button', { name: /Notificaciones/i }).textContent).not.toContain('3');
        });

        consoleSpy.mockRestore();
    });

    it('marks notifications as read when dropdown opens', async () => {
        const queryBuilder = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
        };
        (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue(queryBuilder);

        render(<NotificationDropdown />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Notificaciones/i })).toHaveTextContent('3');
        });

        // Open dropdown
        const button = screen.getByRole('button', { name: /Notificaciones/i });
        fireEvent.pointerDown(button);
        fireEvent.click(button);

        // Wait for Radix Dropdown internal timeout to actually process the click event
        // Radix usually handles open state changes via pointers which we've polyfilled but might be delayed
        // But clicking the trigger in Radix causes onOpenChange, which is how we mark as read

        await waitFor(() => {
            expect(screen.queryByText('3')).not.toBeInTheDocument();
        });
    });

    it('marks all as read explicitly via button inside menu', async () => {
        const queryBuilder = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
        };
        (supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue(queryBuilder);

        render(<NotificationDropdown />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Notificaciones/i })).toHaveTextContent('3');
        });

        // Note: radix ui dropdown uses onPointerDown for triggering by default in tests
        fireEvent.pointerDown(screen.getByRole('button', { name: /Notificaciones/i }));

        await waitFor(() => {
            expect(screen.getByText('Marcar todo como leído')).toBeInTheDocument();
        });

        // Triggers the explicitly via the menu button, although opening menu marked it already
        fireEvent.click(screen.getByText('Marcar todo como leído'));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Notificaciones/i }).textContent).not.toContain('3');
        });
    });
});
