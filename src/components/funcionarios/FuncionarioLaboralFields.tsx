import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
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

interface Props {
    control: UseFormReturn<FuncionarioFormData>['control'];
    setValue: UseFormReturn<FuncionarioFormData>['setValue'];
    getDepartamentos: any;
    createDepartamento: any;
}

export function FuncionarioLaboralFields({ control, setValue, getDepartamentos, createDepartamento }: Props) {
    return (
        <>
            <div className="space-y-2 col-span-2 mt-4">
                <h3 className="font-semibold border-b pb-2">Datos Laborales</h3>
            </div>

            <FormField
                control={control}
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
                control={control}
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
                control={control}
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
                control={control}
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
                                            success: (data: any) => {
                                                setValue('departamento_id', data.id);
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
                                {getDepartamentos.data && getDepartamentos.data.map((depto: any) => (
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
                control={control}
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
                control={control}
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
                control={control}
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
        </>
    );
}
