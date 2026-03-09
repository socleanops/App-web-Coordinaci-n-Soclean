import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map, MapPin, User, Navigation } from 'lucide-react';
import { useServicios } from '@/hooks/useServicios';
import { useGetFuncionarios } from '@/hooks/useFuncionarios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function LogisticsMap() {
    const { getServicios } = useServicios();
    const { data: servicios = [] } = getServicios;
    const getFuncionarios = useGetFuncionarios();
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
                <div className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-coreops-primary" />
                                1. Seleccionar Servicio
                            </CardTitle>
                            <CardDescription>Escoge el servicio al que deseas enviar personal</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Elige un servicio..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeServices.length === 0 && <SelectItem value="none" disabled>No hay servicios activos</SelectItem>}
                                    {activeServices.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.clientes?.razon_social} - {s.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedService && (
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                                    <p className="font-semibold">{selectedService.clientes?.razon_social}</p>
                                    <p className="text-muted-foreground break-words">{selectedService.direccion}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" />
                                2. Elegir Funcionario
                            </CardTitle>
                            <CardDescription>Identifica desde dónde parte el empleado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedFuncionarioId} onValueChange={setSelectedFuncionarioId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Elige un funcionario..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeFuncionarios.length === 0 && <SelectItem value="none" disabled>No hay funcionarios activos</SelectItem>}
                                    {activeFuncionarios.map(f => (
                                        <SelectItem key={f.id} value={f.id}>
                                            {f.profiles?.nombre} {f.profiles?.apellido} - {f.cargo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedFuncionario && (
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                                    <p className="font-semibold">{selectedFuncionario.profiles?.nombre} {selectedFuncionario.profiles?.apellido}</p>
                                    <p className="text-muted-foreground break-words">{selectedFuncionario.direccion}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button
                        className="w-full h-12 text-md shadow-lg"
                        disabled={!selectedService || !selectedFuncionario}
                        onClick={handleGenerateRoute}
                    >
                        Generar Mapeo
                    </Button>
                </div>

                {/* Right Panel - Map Display */}
                <div className="lg:col-span-2">
                    <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm h-full flex flex-col min-h-[500px]">
                        <CardContent className="p-1 flex-grow relative">
                            {mapUrl ? (
                                <div className="h-full w-full rounded-lg overflow-hidden relative group">
                                    {/* Google Maps Embed iframe */}
                                    <iframe
                                        title="Ubicación de Logística"
                                        src={mapUrl}
                                        width="100%"
                                        height="100%"
                                        className="h-[550px]"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>

                                    {/* Overlay Helper */}
                                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-72 backdrop-blur-md animate-in fade-in slide-in-from-right-4">
                                        <h4 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-2">
                                            <Navigation className="h-4 w-4 text-emerald-500" />
                                            Asistencia de Ruta
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                            Calcula la mejor ruta de transporte público o privado para que tu empleado llegue al servicio a tiempo.
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={handleOpenExternalRoute}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            Ver Rutas de Ómnibus
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center h-[550px] bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <Map className="h-16 w-16 mb-4 opacity-20" />
                                    <h3 className="text-xl font-semibold mb-2">Visualizador Operativo</h3>
                                    <p className="max-w-sm">
                                        Selecciona un servicio a realizar y el funcionario designado en el panel lateral para cargar la información de traslado.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
