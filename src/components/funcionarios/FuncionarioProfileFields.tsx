import type { UseFormReturn } from 'react-hook-form';
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
    isEditing: boolean;
}

export function FuncionarioProfileFields({ control, isEditing }: Props) {
    return (
        <>
            <div className="space-y-2 col-span-2">
                <h3 className="font-semibold border-b pb-2">Datos de Perfil (Acceso)</h3>
            </div>
            <FormField
                control={control}
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
                control={control}
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
                control={control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Correo Electrónico (Opcional)</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="usuario@empresa.com" disabled={isEditing} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {!isEditing && (
                <FormField
                    control={control}
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
                control={control}
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
        </>
    );
}
