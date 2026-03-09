import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';

export function SecuritySettings() {
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-red-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                    <Key className="h-5 w-5" /> Acceso y Contraseña
                </CardTitle>
                <CardDescription>Configuración sensible de tu credencial de acceso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="old-pass">Contraseña Actual</Label>
                        <Input id="old-pass" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-pass">Nueva Contraseña</Label>
                        <Input id="new-pass" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-pass">Confirmar Contraseña</Label>
                        <Input id="confirm-pass" type="password" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 bg-red-50/30 dark:bg-red-900/10">
                <Button variant="destructive">
                    Actualizar Credenciales
                </Button>
            </CardFooter>
        </Card>
    );
}
