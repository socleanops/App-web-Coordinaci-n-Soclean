import type { UseFormReturn } from "react-hook-form";
import type { FacturaFormData } from "@/lib/validations/facturacion";
import type { Cliente } from "@/types";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    form: UseFormReturn<FacturaFormData>;
    clientes: Cliente[];
}

export function FacturaBasicInfoFields({ form, clientes }: Props) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>Cliente a Facturar</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Cliente" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {clientes.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.razon_social} {c.rut ? `(RUT: ${c.rut})` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Referencia Interna (Nro de Registro)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. A-0001" {...field} />
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
                        <FormLabel>Estado Inicial</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="borrador">Borrador</SelectItem>
                                <SelectItem value="emitida">Emitida (Pendiente de Pago)</SelectItem>
                                <SelectItem value="pagada">Pagada</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="fecha_emision"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fecha del Servicio</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="fecha_vencimiento"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vencimiento (Opcional)</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
