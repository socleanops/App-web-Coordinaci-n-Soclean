import { Card, CardContent } from '@/components/ui/card';
import { Map, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapDisplayProps {
    mapUrl: string;
    handleOpenExternalRoute: () => void;
}

export default function MapDisplay({ mapUrl, handleOpenExternalRoute }: MapDisplayProps) {
    return (
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
    );
}
