/* eslint-disable */
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map, MapPin, User, Navigation, Loader2 } from 'lucide-react';
import { useServicios } from '@/hooks/useServicios';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';

const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization" | "routes")[] = ['places', 'routes'];
const MVD_CENTER = { lat: -34.9011, lng: -56.1645 };

export default function LogisticsMap() {
    const { getServicios } = useServicios();
    const { data: servicios = [] } = getServicios;
    const { getFuncionarios } = useFuncionarios();
    const { data: funcionarios = [] } = getFuncionarios;

    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string>('');
    const [directionsMode, setDirectionsMode] = useState<'DRIVING' | 'TRANSIT'>('TRANSIT');
    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [serviceMarkers, setServiceMarkers] = useState<{id: string, lat: number, lng: number, title: string}[]>([]);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
    });

    const selectedService = servicios.find(s => s.id === selectedServiceId);
    const selectedFuncionario = funcionarios.find(f => f.id === selectedFuncionarioId);

    const activeServices = useMemo(() => servicios.filter(s => s.estado === 'activo'), [servicios]);
    const activeFuncionarios = useMemo(() => funcionarios.filter(f => f.estado === 'activo'), [funcionarios]);

    const [hasAttemptedGeocode, setHasAttemptedGeocode] = useState(false);

    // Geocode active services to place green markers on the map
    useEffect(() => {
        if (!isLoaded || activeServices.length === 0 || serviceMarkers.length > 0 || hasAttemptedGeocode) return;
        
        setHasAttemptedGeocode(true); // Prevent re-runs if it fails or returns empty
        
        const geocoder = new window.google.maps.Geocoder();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
        const fetchGeocodes = async () => {
            const newMarkers[] = [];
            for (const s of activeServices) {
                try {
                    const res = await geocoder.geocode({ address: `${s.direccion}, Montevideo, Uruguay` });
                    if (res.results && res.results[0]) {
                        newMarkers.push({
                            id: s.id,
                            title: `${s.clientes?.razon_social || ''} - ${s.nombre}`,
                            lat: res.results[0].geometry.location.lat(),
                            lng: res.results[0].geometry.location.lng()
                        });
                    }
                } catch (error) {
                    console.log(`Geocoding error for ${s.direccion}`, error);
                }
            }
            if (newMarkers.length > 0) {
                setServiceMarkers(newMarkers);
            }
        };
        fetchGeocodes();
    }, [isLoaded, activeServices, serviceMarkers.length, hasAttemptedGeocode]);

    const handleGenerateRoute = async () => {
        if (!selectedService || !selectedFuncionario || !isLoaded) return;
        
        const google = window.google;
        const directionsService = new google.maps.DirectionsService();

        try {
            const results = await directionsService.route({
                origin: `${selectedFuncionario.direccion}, Montevideo, Uruguay`,
                destination: `${selectedService.direccion}, Montevideo, Uruguay`,
                travelMode: google.maps.TravelMode[directionsMode] || google.maps.TravelMode.TRANSIT,
            });
            setDirectionsResponse(results);
            if (results.routes[0]?.legs[0]) {
                setDistance(results.routes[0].legs[0].distance?.text || '');
                setDuration(results.routes[0].legs[0].duration?.text || '');
            }
        } catch (error) {
            console.error("Error al calcular ruta:", error);
        }
    };

    const handleOpenExternalRoute = () => {
        if (!selectedService || !selectedFuncionario) return;
        const origin = encodeURIComponent(`${selectedFuncionario.direccion}, Montevideo`);
        const destination = encodeURIComponent(`${selectedService.direccion}, Montevideo`);
        // Open google maps directions specifying transit (buses) to show full transit options
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
                    <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm h-[600px] flex flex-col">
                        <CardContent className="p-2 flex-grow relative overflow-hidden h-full rounded-b-lg">
                            {!isLoaded ? (
                                <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    {loadError ? (
                                        <>
                                            <Map className="h-16 w-16 mb-4 text-red-500 opacity-50" />
                                            <h3 className="text-xl font-semibold mb-2">Error de Google Maps</h3>
                                            <p className="max-w-sm">No se pudo cargar la API Key. Configura <code>VITE_GOOGLE_MAPS_API_KEY</code> en tu Vercel / .env</p>
                                        </>
                                    ) : (
                                        <>
                                            <Loader2 className="h-16 w-16 mb-4 opacity-50 animate-spin" />
                                            <h3 className="text-xl font-semibold mb-2">Cargando Mapas...</h3>
                                        </>
                                    )}
                                </div>
                            ) : directionsResponse ? (
                                <div className="h-full w-full relative">
                                    <GoogleMap
                                        center={MVD_CENTER}
                                        zoom={12}
                                        mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
                                        options={{
                                            zoomControl: true,
                                            streetViewControl: false,
                                            mapTypeControl: false,
                                            fullscreenControl: true,
                                        }}
                                    >
                                        <DirectionsRenderer
                                            directions={directionsResponse}
                                            options={{
                                                polylineOptions: { strokeColor: '#10b981', strokeWeight: 5 }
                                            }}
                                        />
                                        {serviceMarkers.map(m => (
                                            <Marker 
                                                key={m.id} 
                                                position={{lat: m.lat, lng: m.lng}} 
                                                title={m.title}
                                                icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png" 
                                            />
                                        ))}
                                    </GoogleMap>

                                    {/* Overlay Helper */}
                                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-72 backdrop-blur-md animate-in fade-in slide-in-from-right-4">
                                        <h4 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-2">
                                            <Navigation className="h-4 w-4 text-emerald-500" />
                                            Información de Ruta
                                        </h4>
                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm font-semibold flex justify-between">
                                                <span className="text-slate-500">Distancia:</span> 
                                                <span>{distance}</span>
                                            </p>
                                            <p className="text-sm font-semibold flex justify-between">
                                                <span className="text-slate-500">Tiempo estimado:</span> 
                                                <span className="text-emerald-600 dark:text-emerald-400">{duration}</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant={directionsMode === 'TRANSIT' ? 'default' : 'outline'}
                                                onClick={() => { setDirectionsMode('TRANSIT'); handleGenerateRoute(); }}
                                                className={`flex-1 ${directionsMode === 'TRANSIT' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                                            >
                                                Ómnibus
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={directionsMode === 'DRIVING' ? 'default' : 'outline'}
                                                onClick={() => { setDirectionsMode('DRIVING'); handleGenerateRoute(); }}
                                                className={`flex-1 ${directionsMode === 'DRIVING' ? 'bg-coreops-primary text-white' : ''}`}
                                            >
                                                Auto
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={handleOpenExternalRoute}
                                            className="w-full mt-3 font-semibold"
                                        >
                                            Comparar todos los Ómnibus
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <GoogleMap
                                        center={MVD_CENTER}
                                        zoom={12}
                                        mapContainerStyle={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                                        options={{ disableDefaultUI: true }}
                                    >
                                        {serviceMarkers.map(m => (
                                            <Marker 
                                                key={m.id} 
                                                position={{lat: m.lat, lng: m.lng}} 
                                                title={m.title}
                                                icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png" 
                                            />
                                        ))}
                                    </GoogleMap>
                                    <div className="z-10 bg-white/90 dark:bg-slate-900/90 p-6 rounded-2xl shadow-xl backdrop-blur-md">
                                        <Map className="h-16 w-16 mb-4 opacity-40 mx-auto" />
                                        <h3 className="text-xl font-semibold mb-2">Visualizador Operativo</h3>
                                        <p className="max-w-sm text-sm">
                                            Selecciona un servicio y el funcionario designado en el panel lateral para calcular la mejor ruta.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
