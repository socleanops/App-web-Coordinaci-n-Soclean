import { AuditoriaTable } from '@/components/auditoria/AuditoriaTable';
import { History } from 'lucide-react';
import { useAuditoria } from '@/hooks/useAuditoria';

export default function Auditoria() {
    const { getAuditLogs } = useAuditoria();
    const { isLoading, isError, error } = getAuditLogs;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="h-8 w-8 text-primary" />
                        Historial de Auditoría
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Registro de cambios (inserciones, actualizaciones y eliminaciones) en el sistema.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-slate-500">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                            <p>Cargando historial...</p>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-64 text-rose-500 gap-2">
                        <History className="h-10 w-10" />
                        <p className="font-medium">Error al cargar datos</p>
                        <p className="text-sm text-slate-500">{error.message}</p>
                    </div>
                ) : (
                    <AuditoriaTable data={getAuditLogs.data || []} />
                )}
            </div>
        </div>
    );
}
