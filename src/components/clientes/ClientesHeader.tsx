import { Button } from '@/components/ui/button';
import { Building2, PlusCircle } from 'lucide-react';

interface ClientesHeaderProps {
    onBulkImport: () => void;
    onAddNew: () => void;
}

export function ClientesHeader({ onBulkImport, onAddNew }: ClientesHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <Building2 className="h-8 w-8" />
                    Clientes
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Gestiona la cartera de empresas o particulares a los que prestas servicios.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={onBulkImport} variant="outline" className="border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 h-11">
                    Carga Masiva
                </Button>
                <Button onClick={onAddNew} className="bg-primary group hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all h-11 shrink-0">
                    <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                    Añadir Cliente
                </Button>
            </div>
        </div>
    );
}
