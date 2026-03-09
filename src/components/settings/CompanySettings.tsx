import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CompanySettingsProps {
    isSaving: boolean;
    handleSave: () => void;
}

export function CompanySettings({ isSaving, handleSave }: CompanySettingsProps) {
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Datos de la Empresa</CardTitle>
                <CardDescription>Configuración global de Soclean que afecta a los reportes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="razon">Razón Social</Label>
                        <Input id="razon" defaultValue="Soclean Coordinación" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rut">RUT</Label>
                        <Input id="rut" defaultValue="210000000018" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="direccion">Dirección Central</Label>
                        <Input id="direccion" defaultValue="Montevideo, Uruguay" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono Principal</Label>
                        <Input id="telefono" defaultValue="+598 90 000 000" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 bg-slate-50/50 dark:bg-slate-900/50">
                <Button onClick={handleSave} disabled={isSaving} className="ml-auto bg-coreops-primary hover:bg-coreops-secondary">
                    Guardar Datos de Empresa
                </Button>
            </CardFooter>
        </Card>
    );
}
