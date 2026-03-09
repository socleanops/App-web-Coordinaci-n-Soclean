import { useState } from 'react';
import { Map } from 'lucide-react';
import { useServicios } from '@/hooks/useServicios';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import SelectionPanel from '@/components/logistics/SelectionPanel';
import MapDisplay from '@/components/logistics/MapDisplay';

export default function LogisticsMap() {
    const { getServicios } = useServicios();
    const { data: servicios = [] } = getServicios;
    const { getFuncionarios } = useFuncionarios();
    const { data: funcionarios = [] } = getFuncionarios;

    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string>('');
    const [mapUrl, setMapUrl] = useState<string>('');

    const selectedService = servicios.find(s => s.id === selectedServiceId);
    const selectedFuncionario = funcionarios.find(f => f.id === selectedFuncionarioId);

    const activeServices = servicios.filter(s => s.estado === 'activo');
    const activeFuncionarios = funcionarios.filter(f => f.estado === 'activo');

    const handleGenerateRoute = () => {
        if (!selectedService || !selectedFuncionario) return;

        // Use standard Google Maps directions link as fallback or Embed style
        const destination = encodeURIComponent(selectedService.direccion);
        // Using Maps Embed is cleaner. 
        // We set src for iframe. Usually directions embed needs API key, but we can do a hacky embed using standard query if simple, or just a direct link to Maps.
        // Actually, the easiest is to just open a direct link in a new tab for "Buses", or embed a search of the destination only and display the link externally. Let's do a basic map for the service location, and an external link for the full navigation route to see buses.
        const url = `https://maps.google.com/maps?q=${destination}&output=embed`;
        setMapUrl(url);
    };

    const handleOpenExternalRoute = () => {
        if (!selectedService || !selectedFuncionario) return;
        const origin = encodeURIComponent(selectedFuncionario.direccion);
        const destination = encodeURIComponent(selectedService.direccion);
        // Open google maps directions specifying transit (buses)
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`, '_blank');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <Map className="h-8 w-8" />
                        Logística y Rutas
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Asigna funcionarios a locaciones y asístelos en su trayecto hacia cada servicio.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Selection Controls */}
                <SelectionPanel
                    activeServices={activeServices}
                    activeFuncionarios={activeFuncionarios}
                    selectedServiceId={selectedServiceId}
                    setSelectedServiceId={setSelectedServiceId}
                    selectedFuncionarioId={selectedFuncionarioId}
                    setSelectedFuncionarioId={setSelectedFuncionarioId}
                    selectedService={selectedService}
                    selectedFuncionario={selectedFuncionario}
                    handleGenerateRoute={handleGenerateRoute}
                />

                {/* Right Panel - Map Display */}
                <MapDisplay
                    mapUrl={mapUrl}
                    handleOpenExternalRoute={handleOpenExternalRoute}
                />
            </div>
        </div>
    );
}
