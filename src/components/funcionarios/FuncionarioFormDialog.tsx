import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
} from '@/components/ui/form';
import type { FuncionarioFormData } from '@/lib/validations/funcionario';
import { funcionarioSchema } from '@/lib/validations/funcionario';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { FuncionarioProfileFields } from './FuncionarioProfileFields';
import { FuncionarioLaboralFields } from './FuncionarioLaboralFields';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    funcionarioToEdit?: any | null; // using any for simplicity, usually Funcionario type
}

export function FuncionarioFormDialog({ open, onOpenChange, funcionarioToEdit }: Props) {
    const { getDepartamentos, createDepartamento, createFuncionario, updateFuncionario } = useFuncionarios();
    const form = useForm<FuncionarioFormData>({
        resolver: zodResolver(funcionarioSchema) as any,
        defaultValues: {
            nombre: '',
            apellido: '',
            email: '',
            password: '',
            rol: 'funcionario',
            cedula: '',
            cargo: '',
            departamento_id: '',
            direccion: '',
            fecha_ingreso: new Date().toISOString().split('T')[0],
            tipo_contrato: '',
            estado: 'activo',
        },
    });

    useEffect(() => {
        if (funcionarioToEdit) {
            form.reset({
                id: funcionarioToEdit.id,
                nombre: funcionarioToEdit.profiles?.nombre || '',
                apellido: funcionarioToEdit.profiles?.apellido || '',
                email: funcionarioToEdit.profiles?.email || '',
                password: '', // do not set password on edit
                rol: (funcionarioToEdit.profiles?.rol as any) || 'funcionario',
                cedula: funcionarioToEdit.cedula,
                cargo: funcionarioToEdit.cargo,
                departamento_id: funcionarioToEdit.departamento_id || '',
                direccion: funcionarioToEdit.direccion || '',
                fecha_ingreso: funcionarioToEdit.fecha_ingreso,
                tipo_contrato: funcionarioToEdit.tipo_contrato,
                estado: funcionarioToEdit.estado as any,
            });
        } else {
            form.reset();
        }
    }, [funcionarioToEdit, form]);

    const onSubmit = async (data: FuncionarioFormData) => {
        const isEditing = !!funcionarioToEdit;
        const loadingId = toast.loading(isEditing ? 'Actualizando funcionario...' : 'Creando perfil y registrando funcionario...');

        try {
            if (isEditing) {
                await updateFuncionario.mutateAsync({ id: funcionarioToEdit!.id, data });
                toast.success('Funcionario actualizado correctamente', { id: loadingId });
            } else {
                await createFuncionario.mutateAsync(data);
                toast.success('Usuario y funcionario creados correctamente', { id: loadingId });
            }
            onOpenChange(false);
        } catch (error: any) {
            console.error("Form Submit Error:", error);
            toast.error(`Error: ${error.message || 'No se pudo guardar la información'}`, { id: loadingId, duration: 8000 });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{funcionarioToEdit ? 'Editar Funcionario' : 'Añadir Nuevo Funcionario'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FuncionarioProfileFields
                                control={form.control}
                                isEditing={!!funcionarioToEdit}
                            />

                            <FuncionarioLaboralFields
                                control={form.control}
                                setValue={form.setValue}
                                getDepartamentos={getDepartamentos}
                                createDepartamento={createDepartamento}
                            />
                        </div>

                        <div className="flex justify-end pt-6 border-t mt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Guardando...' : (funcionarioToEdit ? 'Actualizar' : 'Guardar y Crear Acceso')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
