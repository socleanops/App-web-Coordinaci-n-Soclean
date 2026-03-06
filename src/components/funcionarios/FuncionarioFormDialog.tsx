import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { FuncionarioFormData } from '@/lib/validations/funcionario';
import { funcionarioSchema } from '@/lib/validations/funcionario';
import { useFuncionarios } from '@/hooks/useFuncionarios';

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
                            <div className="space-y-2 col-span-2">
                                <h3 className="font-semibold border-b pb-2">Datos de Perfil (Acceso)</h3>
                            </div>
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Juan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="apellido"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="usuario@empresa.com" disabled={!!funcionarioToEdit} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!funcionarioToEdit && (
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contraseña Inicial (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Autogenerada si se omite..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="rol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rol de Sistema</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar rol" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="funcionario">Funcionario</SelectItem>
                                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                                <SelectItem value="admin">Administrador</SelectItem>
                                                <SelectItem value="facturador">Facturador</SelectItem>
                                                <SelectItem value="superadmin">Super Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2 col-span-2 mt-4">
                                <h3 className="font-semibold border-b pb-2">Datos Laborales</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="cedula"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cédula / DNI</FormLabel>
                                        <FormControl>
                                            <Input placeholder="12345678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cargo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Encargado de Limpieza" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tipo_contrato"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Contrato</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="indefinido">Indefinido</SelectItem>
                                                <SelectItem value="zafral">Zafral</SelectItem>
                                                <SelectItem value="jornalero">Jornalero</SelectItem>
                                                <SelectItem value="a_prueba">A prueba</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="departamento_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Departamento</FormLabel>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs text-coreops-primary"
                                                onClick={async () => {
                                                    const name = window.prompt('Nombre del nuevo departamento:');
                                                    if (name) {
                                                        const promise = createDepartamento.mutateAsync(name);
                                                        toast.promise(promise, {
                                                            loading: 'Creando...',
                                                            success: (data) => {
                                                                form.setValue('departamento_id', data.id);
                                                                return 'Departamento añadido';
                                                            },
                                                            error: (err: any) => `Error al crear: ${err.message}`
                                                        });
                                                    }
                                                }}
                                            >
                                                + Añadir
                                            </Button>
                                        </div>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar depto" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {getDepartamentos.data && getDepartamentos.data.map(depto => (
                                                    <SelectItem key={depto.id} value={depto.id}>{depto.nombre}</SelectItem>
                                                ))}
                                                {getDepartamentos.data?.length === 0 && (
                                                    <SelectItem value="none" disabled>No hay departamentos</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fecha_ingreso"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Ingreso</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="direccion"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Dirección Física (Visible en mapa para logística)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Av. 18 de Julio 1234, Montevideo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="activo">Activo</SelectItem>
                                                <SelectItem value="inactivo">Inactivo</SelectItem>
                                                <SelectItem value="vacaciones">Vacaciones</SelectItem>
                                                <SelectItem value="licencia">Licencia</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
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
