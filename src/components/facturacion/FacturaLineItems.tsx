import type { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import type { FacturaFormData } from "@/lib/validations/facturacion";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface Props {
    form: UseFormReturn<FacturaFormData>;
    fields: UseFieldArrayReturn<FacturaFormData, "items">["fields"];
    append: UseFieldArrayReturn<FacturaFormData, "items">["append"];
    remove: UseFieldArrayReturn<FacturaFormData, "items">["remove"];
}

export function FacturaLineItems({ form, fields, append, remove }: Props) {
    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-lg mb-4">Conceptos o Ítems</h3>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-end border-b border-slate-200 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                        <div className="flex-grow w-full">
                            <FormField
                                control={form.control}
                                name={`items.${index}.descripcion`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Detalle del Servicio Realizado</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Limpieza post-obra en planta baja..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="w-full sm:w-24">
                            <FormField
                                control={form.control}
                                name={`items.${index}.cantidad`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Horas Realizadas</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="hidden">
                            <FormField
                                control={form.control}
                                name={`items.${index}.precio_unitario`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Precio Unit. ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 shrink-0 mb-0.5"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ descripcion: '', cantidad: 1, precio_unitario: 0 })}
            >
                <PlusCircle className="h-4 w-4 mr-2" /> Agregar Concepto
            </Button>
        </div>
    );
}
