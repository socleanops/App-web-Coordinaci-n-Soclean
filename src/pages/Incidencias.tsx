import { useState } from 'react';
import { IncidenciasTable } from '@/components/incidencias/IncidenciasTable';
import { IncidenciaFormDialog } from '@/components/incidencias/IncidenciaFormDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertOctagon } from 'lucide-react';
import { useIncidencias } from '@/hooks/useIncidencias';

export default function Incidencias() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { getIncidencias } = useIncidencias();
    const { isLoading, isError, error } = getIncidencias;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertOctagon className="h-8 w-8 text-rose-500" />
                        Incidencias y Reemplazos
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Gestiona tardanzas, ausencias, licencias y asigna reemplazos.
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto shadow-md">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Registrar Incidencia
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-slate-500">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                            <p>Cargando incidencias...</p>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-64 text-rose-500 gap-2">
                        <AlertOctagon className="h-10 w-10" />
                        <p className="font-medium">Error al cargar datos</p>
                        <p className="text-sm text-slate-500">{error.message}</p>
                    </div>
                ) : (
                    <IncidenciasTable data={getIncidencias.data || []} />
                )}
            </div>

            <IncidenciaFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    );
}
