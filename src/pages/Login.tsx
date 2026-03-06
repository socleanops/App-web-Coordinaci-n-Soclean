import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
    email: z.string().email('Debe ser un correo electrónico válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const setUser = useAuthStore((state) => state.setUser);
    const setRole = useAuthStore((state) => state.setRole);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // Fetch role from profiles table
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('rol')
                    .eq('id', authData.user.id)
                    .single();

                if (!profileError && profileData) {
                    setRole(profileData.rol);
                }

                setUser(authData.user);
                navigate('/'); // Redirect to dashboard
            }
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 border-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
                <div className="text-center mb-8 animate-in slide-in-from-bottom-5 duration-500">
                    <img src="/soclean-logo.png" alt="Soclean Logo" className="mx-auto h-28 mb-2 object-contain drop-shadow-md" />
                </div>
                <Card className="shadow-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md animate-in zoom-in-95 duration-500 delay-150 fill-mode-backwards w-full">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Bienvenido de nuevo</CardTitle>
                        <CardDescription className="text-center">
                            Ingresa tu correo electrónico y contraseña
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@empresa.com"
                                    {...register('email')}
                                    disabled={isLoading}
                                    className="bg-background/50 focus:bg-background transition-colors"
                                />
                                {errors.email && (
                                    <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <a href="#" className="text-sm text-primary hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    disabled={isLoading}
                                    className="bg-background/50 focus:bg-background transition-colors"
                                />
                                {errors.password && (
                                    <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20 text-center">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full h-11 text-md shadow-md mt-4" disabled={isLoading}>
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
