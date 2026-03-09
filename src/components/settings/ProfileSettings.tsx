import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { User } from '@supabase/supabase-js';

interface ProfileSettingsProps {
    user: User | null;
    role: string | null;
    isSaving: boolean;
    handleSave: () => void;
}

export function ProfileSettings({ user, role, isSaving, handleSave }: ProfileSettingsProps) {
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tus datos de contacto y rol operativo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input id="nombre" defaultValue={user?.user_metadata?.nombre || ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input id="apellido" defaultValue={user?.user_metadata?.apellido || ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input id="email" defaultValue={user?.email || ''} disabled className="bg-slate-50 text-slate-500" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rol">Rol Asignado</Label>
                        <Input id="rol" defaultValue={role?.toUpperCase() || ''} disabled className="bg-slate-50 text-slate-500 font-bold" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 bg-slate-50/50 dark:bg-slate-900/50">
                <Button onClick={handleSave} disabled={isSaving} className="ml-auto bg-coreops-primary hover:bg-coreops-secondary">
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </CardFooter>
        </Card>
    );
}
