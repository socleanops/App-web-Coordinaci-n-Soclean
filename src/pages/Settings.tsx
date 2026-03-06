import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Shield, Bell, Key, Store, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export default function Settings() {
    const { user, role } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);

    // Some placeholder state for the demo
    const [activeTab, setActiveTab] = useState('perfil');
    const [theme, setTheme] = useState('light');
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Configuraciones guardadas correctamente");
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <Store className="h-8 w-8 text-coreops-primary" />
                    Configuración del Sistema
                </h1>
                <p className="text-muted-foreground">
                    Administra tus preferencias, ajustes de cuenta y reglas del negocio.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full mt-6">
                <div className="flex flex-col gap-2 w-full md:w-64 shrink-0 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                        onClick={() => setActiveTab('perfil')}
                        className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'perfil' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        <User className="h-5 w-5" /> Mi Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('empresa')}
                        className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'empresa' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        <Store className="h-5 w-5" /> Datos de Empresa
                    </button>
                    <button
                        onClick={() => setActiveTab('preferencias')}
                        className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'preferencias' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        <Bell className="h-5 w-5" /> Preferencias
                    </button>
                    <button
                        onClick={() => setActiveTab('seguridad')}
                        className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'seguridad' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        <Shield className="h-5 w-5" /> Seguridad
                    </button>
                </div>

                <div className="flex-1">
                    {activeTab === 'perfil' && (
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
                    )}

                    {activeTab === 'empresa' && (
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
                    )}

                    {activeTab === 'preferencias' && (
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle>Apariencia y Notificaciones</CardTitle>
                                <CardDescription>Personaliza tu experiencia dentro de la plataforma.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Tema Visual</h4>
                                        <p className="text-sm text-slate-500">Elige entre modo claro o oscuro.</p>
                                    </div>
                                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg dark:bg-slate-800">
                                        <Button
                                            variant={theme === 'light' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setTheme('light')}
                                            className={theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : ''}
                                        >
                                            <Sun className="h-4 w-4 mr-2" /> Claro
                                        </Button>
                                        <Button
                                            variant={theme === 'dark' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setTheme('dark')}
                                            className={theme === 'dark' ? 'bg-slate-900 text-white shadow-sm' : ''}
                                        >
                                            <Moon className="h-4 w-4 mr-2" /> Oscuro
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Notificaciones UI/UX</h4>
                                        <p className="text-sm text-slate-500">Mostrar alertas emergentes en pantalla.</p>
                                    </div>
                                    <Button
                                        variant={notifications ? 'default' : 'outline'}
                                        onClick={() => setNotifications(!notifications)}
                                        className={notifications ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                                    >
                                        {notifications ? 'Activadas' : 'Desactivadas'}
                                    </Button>
                                </div>

                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'seguridad' && (
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
                    )}
                </div>
            </div>
        </div>
    );
}

