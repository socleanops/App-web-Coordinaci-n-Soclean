import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LogisticsMap from '../../pages/LogisticsMap';
import { useServicios } from '../../hooks/useServicios';
import { useFuncionarios } from '../../hooks/useFuncionarios';
import { useJsApiLoader } from '@react-google-maps/api';

// Mock the hooks
vi.mock('../../hooks/useServicios');
vi.mock('../../hooks/useFuncionarios');
vi.mock('@react-google-maps/api', () => ({
    useJsApiLoader: vi.fn(),
    GoogleMap: ({ children }: any) => <div>{children}</div>,
    DirectionsRenderer: () => null,
    Marker: () => null,
}));

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('LogisticsMap Performance', () => {
    const mockGeocode = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();

        mockGeocode.mockImplementation(async ({ address }) => {
            // Artificial delay of 100ms
            await new Promise(resolve => setTimeout(resolve, 100));
            return {
                results: [{
                    geometry: {
                        location: {
                            lat: () => -34.9,
                            lng: () => -56.1
                        }
                    }
                }]
            };
        });

        // Setup window.google
        (window as any).google = {
            maps: {
                Geocoder: class {
                    geocode = mockGeocode;
                },
                TravelMode: {
                    TRANSIT: 'TRANSIT',
                    DRIVING: 'DRIVING'
                }
            }
        };

        vi.mocked(useJsApiLoader).mockReturnValue({ isLoaded: true, loadError: undefined } as any);

        vi.mocked(useServicios).mockReturnValue({
            getServicios: {
                data: [
                    { id: '1', nombre: 'S1', direccion: 'D1', estado: 'activo', clientes: { razon_social: 'C1' } },
                    { id: '2', nombre: 'S2', direccion: 'D2', estado: 'activo', clientes: { razon_social: 'C2' } },
                    { id: '3', nombre: 'S3', direccion: 'D3', estado: 'activo', clientes: { razon_social: 'C3' } },
                    { id: '4', nombre: 'S4', direccion: 'D4', estado: 'activo', clientes: { razon_social: 'C4' } },
                    { id: '5', nombre: 'S5', direccion: 'D5', estado: 'activo', clientes: { razon_social: 'C5' } },
                ]
            }
        } as any);

        vi.mocked(useFuncionarios).mockReturnValue({
            getFuncionarios: { data: [] }
        } as any);
    });

    it('measures geocoding performance', async () => {
        const startTime = Date.now();

        render(<LogisticsMap />, { wrapper });

        // Wait for markers to be loaded. We know there are 5 active services.
        // Each takes 100ms.
        // Sequential: ~500ms
        // Parallel: ~100ms

        await waitFor(() => {
            // Check if markers are processed by looking for something that depends on serviceMarkers
            // In the code, serviceMarkers are used in GoogleMap
            // Since we mocked GoogleMap, we might need a way to check.
            // But we can just wait for the geocode calls.
            expect(mockGeocode).toHaveBeenCalledTimes(5);
        }, { timeout: 2000 });

        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`Geocoding duration for 5 services: ${duration}ms`);

        // This test is just to establish baseline and verify improvement manually or via assertions
        // For the baseline, we expect it to be > 500ms
    });
});
