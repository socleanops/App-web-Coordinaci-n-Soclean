import { useState } from 'react';
import { FuncionarioFormDialog } from '@/components/funcionarios/FuncionarioFormDialog';
import { FuncionarioBulkImportDialog } from '@/components/funcionarios/FuncionarioBulkImportDialog';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { generateComplexPassword } from '@/lib/utils';
import type { Funcionario } from '@/types';
import { FuncionariosHeader } from '@/components/funcionarios/FuncionariosHeader';
import { FuncionariosTable } from '@/components/funcionarios/FuncionariosTable';
import { FuncionarioCertificacionesDialog } from '@/components/funcionarios/FuncionarioCertificacionesDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { generateComplexPassword } from '@/lib/utils';

export default function Employees() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
    const [isBulkOpen, setIsBulkOpen] = useState(false);

    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [funcionarioToReset, setFuncionarioToReset] = useState<Funcionario | null>(null);

    const [certDialogOpen, setCertDialogOpen] = useState(false);
    const [funcionarioToCert, setFuncionarioToCert] = useState<Funcionario | null>(null);

    const { getFuncionarios, resetPassword } = useFuncionarios();
    const { data: employees = [], isLoading } = getFuncionarios;

    const handleEdit = (funcionario: Funcionario) => {
        setEditingFuncionario(funcionario);
        setIsDialogOpen(true);
    };

    const handleResetPasswordClick = (funcionario: Funcionario) => {
        setFuncionarioToReset(funcionario);
        setResetDialogOpen(true);
    };

    const handleCertificacionesClick = (funcionario: Funcionario) => {
        setFuncionarioToCert(funcionario);
        setCertDialogOpen(true);
    };

    const confirmResetPassword = async () => {
        if (!funcionarioToReset || !funcionarioToReset.profile_id) return;

        try {
            const newPassword = generateComplexPassword(12);
            // Se genera una nueva clave segura
            const newPassword = generateComplexPassword();

            await resetPassword.mutateAsync({
                profileId: funcionarioToReset.profile_id,
                newPassword: newPassword
            });

            toast.success(`Contraseña de ${funcionarioToReset.profiles?.nombre} reseteada a: ${newPassword}`, { duration: 10000 });
            setResetDialogOpen(false);
            setFuncionarioToReset(null);
        } catch (error: any) {
            toast.error(error.message || 'No se pudo resetear la contraseña');
        }
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
                onResetPassword={handleResetPasswordClick}
                onCertificaciones={handleCertificacionesClick}
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

            <FuncionarioCertificacionesDialog 
                open={certDialogOpen}
                onOpenChange={setCertDialogOpen}
                funcionario={funcionarioToCert}
            />

            {/* Dialogo de Confirmación de Reseteo de Clave */}
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Forzar Reseteo de Contraseña</DialogTitle>
                        <DialogDescription>
                            Estás a punto de resetear la contraseña de <strong>{funcionarioToReset?.profiles?.nombre} {funcionarioToReset?.profiles?.apellido}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-4 border border-amber-200 dark:border-amber-800 rounded-md text-sm mt-2 mb-4">
                        Esto invalidará su sesión actual y se le asignará una nueva contraseña segura aleatoria. Podrás indicarle manualmente cuál es su nueva clave para que vuelva a entrar de inmediato.
                        Esto invalidará su sesión actual y se generará una nueva contraseña compleja y aleatoria. Podrás indicarle manualmente cuál es su nueva clave para que vuelva a entrar de inmediato.
                        Esto invalidará su sesión actual y se generará una nueva contraseña segura de forma aleatoria. Podrás indicarle manualmente cuál es su nueva clave para que vuelva a entrar de inmediato.
                        Esto invalidará su sesión actual y se generará una nueva contraseña segura y aleatoria. Podrás indicarle manualmente cuál es su nueva clave para que vuelva a entrar de inmediato.
                    </div>

                    <DialogFooter className="sm:justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)}>
                            Cancelar Operación
                        </Button>
                        <Button
                            type="button"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={confirmResetPassword}
                            disabled={resetPassword.isPending}
                        >
                            {resetPassword.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aplicando...</> : 'Confirmar Reseteo'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
