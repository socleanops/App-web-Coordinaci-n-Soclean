import { Button } from '@/components/ui/button';
import { PlusCircle, UploadCloud } from 'lucide-react';

interface FuncionariosHeaderProps {
    onBulkImport: () => void;
    onAddNew: () => void;
}

export function FuncionariosHeader({ onBulkImport, onAddNew }: FuncionariosHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">Funcionarios</h2>
                <p className="text-muted-foreground text-sm mt-1">Gestiona el personal, contratos y perfiles de acceso.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={onBulkImport} className="gap-2 bg-white dark:bg-slate-800 shadow-sm hover:shadow transition-all h-11 shrink-0 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700">
                    <UploadCloud className="h-4 w-4 text-coreops-secondary" />
                    <span className="hidden sm:inline">Importar Excel</span>
                </Button>
                <Button onClick={onAddNew} className="bg-primary group hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all h-11 shrink-0">
                    <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                    Añadir Funcionario
                </Button>
            </div>
        </div>
    );
}
