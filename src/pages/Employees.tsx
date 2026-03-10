import { useState } from 'react';
import { FuncionarioFormDialog } from '@/components/funcionarios/FuncionarioFormDialog';
import { FuncionarioBulkImportDialog } from '@/components/funcionarios/FuncionarioBulkImportDialog';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { FuncionariosHeader } from '@/components/funcionarios/FuncionariosHeader';
import { FuncionariosTable } from '@/components/funcionarios/FuncionariosTable';

export default function Employees() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFuncionario, setEditingFuncionario] = useState<any>(null);
    const [isBulkOpen, setIsBulkOpen] = useState(false);

    const { getFuncionarios } = useFuncionarios();
    const { data: employees = [], isLoading } = getFuncionarios;

    const handleEdit = (funcionario: any) => {
        setEditingFuncionario(funcionario);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingFuncionario(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <FuncionariosHeader
                onBulkImport={() => setIsBulkOpen(true)}
                onAddNew={handleAddNew}
            />

            <FuncionariosTable
                employees={employees}
                isLoading={isLoading}
                onEdit={handleEdit}
            />

            <FuncionarioFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                funcionarioToEdit={editingFuncionario}
            />

            <FuncionarioBulkImportDialog
                open={isBulkOpen}
                onOpenChange={setIsBulkOpen}
            />
        </div>
    );
}
