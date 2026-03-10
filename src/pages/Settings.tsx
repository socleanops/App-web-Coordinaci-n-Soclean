import { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Shield, Bell, Key, Store, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Settings() {
    const { user, role } = useAuthStore();
    const { theme, setTheme } = useTheme();
    
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);

    const [activeTab, setActiveTab] = useState('perfil');
    const [notifications, setNotifications] = useState(() => localStorage.getItem('soclean-notifications') !== 'false');

    // Empresa form state
    const [empresaId, setEmpresaId] = useState<string | null>(null);
    const [razonSocial, setRazonSocial] = useState('');
    const [rut, setRut] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');

    // Profile form state
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');

    // Password form state
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isChangingPass, setIsChangingPass] = useState(false);

    // Load current profile and empresa config from Supabase
    useEffect(() => {
        async function loadData() {
            if (!user) return;
            
            // Load Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('nombre, apellido')
                .eq('id', user.id)
                .single();

            if (profile) {
                setNombre(profile.nombre || '');
                setApellido(profile.apellido || '');
            }

            // Load Empresa Config
            const { data: empresa } = await supabase
                .from('empresa_config')
                .select('*')
                .limit(1)
                .maybeSingle();
                
            if (empresa) {
                setEmpresaId(empresa.id);
                setRazonSocial(empresa.razon_social || '');
                setRut(empresa.rut || '');
                setDireccion(empresa.direccion || '');
                setTelefono(empresa.telefono || '');
            }
        }
        loadData();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ nombre, apellido })
                .eq('id', user.id);

            if (error) throw error;
            toast.success("Perfil actualizado correctamente en la base de datos.");
        } catch (err: any) {
            toast.error(err.message || "No se pudo guardar el perfil.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveEmpresa = async () => {
        if (role !== 'superadmin') {
            toast.error("Solo los superadministradores pueden modificar los datos de la empresa.");
            return;
        }
        setIsSavingEmpresa(true);
        try {
            const payload = {
                razon_social: razonSocial,
                rut,
                direccion,
                telefono,
                updated_at: new Date().toISOString()
            };

            let err;
            if (empresaId) {
                const { error } = await supabase.from('empresa_config').update(payload).eq('id', empresaId);
                err = error;
            } else {
                const { data, error } = await supabase.from('empresa_config').insert([payload]).select().single();
                if (data) setEmpresaId(data.id);
                err = error;
            }

            if (err) throw err;
            toast.success("Datos de la empresa actualizados exitosamente.");
        } catch (error: any) {
            toast.error(error.message || "Error al guardar los datos de la empresa.");
        } finally {
            setIsSavingEmpresa(false);
        }
    };

    const toggleNotifications = () => {
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem('soclean-notifications', String(newVal));
        if (newVal) {
            toast.success("Notificaciones UI/UX activadas.");
        } else {
            toast.info("Notificaciones UI/UX desactivadas.");
        }
    };

    const handleChangePassword = async () => {
        if (!newPass || newPass.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (newPass !== confirmPass) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        setIsChangingPass(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPass });
            if (error) throw error;
            toast.success("Contraseña actualizada exitosamente.");
            setNewPass('');
            setConfirmPass('');
        } catch (err: any) {
            toast.error(err.message || "No se pudo cambiar la contraseña.");
        } finally {
            setIsChangingPass(false);
        }
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
                    <button onClick={() => setActiveTab('perfil')} className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'perfil' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>
                        <User className="h-5 w-5" /> Mi Perfil
                    </button>
                    <button onClick={() => setActiveTab('empresa')} className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'empresa' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>
                        <Store className="h-5 w-5" /> Datos de Empresa
                    </button>
                    <button onClick={() => setActiveTab('preferencias')} className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'preferencias' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>
                        <Bell className="h-5 w-5" /> Preferencias
                    </button>
                    <button onClick={() => setActiveTab('seguridad')} className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'seguridad' ? 'bg-white dark:bg-slate-900 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>
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
                                        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apellido">Apellido</Label>
                                        <Input id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
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
                                <Button onClick={handleSaveProfile} disabled={isSaving} className="ml-auto bg-coreops-primary hover:bg-coreops-secondary">
                                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === 'empresa' && (
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle>Datos de la Empresa</CardTitle>
                                <CardDescription>Configuración global de Soclean que afecta a los reportes. Solo accesible por Superadmin.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="razon">Razón Social</Label>
                                        <Input id="razon" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} disabled={role !== 'superadmin'} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rut">RUT</Label>
                                        <Input id="rut" value={rut} onChange={(e) => setRut(e.target.value)} disabled={role !== 'superadmin'} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="direccion">Dirección Central</Label>
                                        <Input id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} disabled={role !== 'superadmin'} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono Principal</Label>
                                        <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} disabled={role !== 'superadmin'} />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-6 bg-slate-50/50 dark:bg-slate-900/50">
                                <Button onClick={handleSaveEmpresa} disabled={isSavingEmpresa || role !== 'superadmin'} className="ml-auto bg-coreops-primary hover:bg-coreops-secondary">
                                    {isSavingEmpresa ? 'Guardando...' : 'Guardar Datos de Empresa'}
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
                                        <Button variant={theme === 'light' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : ''}>
                                            <Sun className="h-4 w-4 mr-2" /> Claro
                                        </Button>
                                        <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-slate-900 text-white shadow-sm' : ''}>
                                            <Moon className="h-4 w-4 mr-2" /> Oscuro
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Notificaciones UI/UX</h4>
                                        <p className="text-sm text-slate-500">Mostrar alertas emergentes en pantalla.</p>
                                    </div>
                                    <Button variant={notifications ? 'default' : 'outline'} onClick={toggleNotifications} className={notifications ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
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
                                    <Key className="h-5 w-5" /> Cambiar Mi Contraseña
                                </CardTitle>
                                <CardDescription>Configura una nueva contraseña segura para tu cuenta.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="max-w-md space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-pass">Nueva Contraseña</Label>
                                        <Input id="new-pass" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Mínimo 6 caracteres" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-pass">Confirmar Contraseña</Label>
                                        <Input id="confirm-pass" type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Repite la nueva contraseña" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-6 bg-red-50/30 dark:bg-red-900/10">
                                <Button variant="destructive" onClick={handleChangePassword} disabled={isChangingPass}>
                                    {isChangingPass ? 'Actualizando...' : 'Actualizar Credenciales'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
