import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Funcionario } from '@/types';
import type { FuncionarioFormData } from '@/lib/validations/funcionario';
import { createClient } from '@supabase/supabase-js';
import { generateSecureRandomString } from '@/lib/utils';
import { toast } from 'sonner';

// Special client that doesn't persist session, so admin can create users without being logged out
const authClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co',
    import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
    { auth: { persistSession: false, autoRefreshToken: false } }
);

export function useFuncionarios() {
    const queryClient = useQueryClient();

    const getFuncionarios = useQuery({
        queryKey: ['funcionarios'],
        queryFn: async (): Promise<Funcionario[]> => {
            const { data, error } = await supabase
                .from('funcionarios')
                .select(`
          *,
          profiles(*),
          departamentos(nombre)
        `)
                .order('fecha_ingreso', { ascending: false });

            if (error) throw new Error(error.message);
            
            return data;
        },
    });

    const getDepartamentos = useQuery({
        queryKey: ['departamentos'],
        queryFn: async () => {
            const { data, error } = await supabase.from('departamentos').select('id, nombre');
            if (error) throw new Error(error.message);
            return data;
        },
    });

    const createDepartamento = useMutation({
        mutationFn: async (nombre: string) => {
            const { data, error } = await supabase.from('departamentos').insert({ nombre }).select().single();
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departamentos'] });
        },
    });
    const createFuncionario = useMutation({
        mutationFn: async (formData: FuncionarioFormData) => {
            const tid = toast.loading('1/5 Iniciando creación...');
            let currentStep = '1/5 Iniciando creación...';

            // Helper to update toast loading step
            const updateStep = (step: string) => {
                currentStep = step;
                toast.loading(step, { id: tid });
            };

            // Process the creation logic
            const processPromise = (async () => {
                try {
                    console.log('[useFuncionarios] Starting createFuncionario', new Date().toISOString(), 'Data:', formData);
                    let profileId = formData.id; // may already exist

                    const randomSuffix = generateSecureRandomString(6);
                    const safeEmail = formData.email?.trim() || `ci_${formData.cedula.replace(/\D/g, '')}_${randomSuffix}@soclean.internal`;
                    const safePassword = formData.password?.trim() || `SC${formData.cedula.replace(/\D/g, '')}#2026`;

                    // 1. Create Auth User if needed
                    if (!profileId) {
                        updateStep('2/5 Buscando perfil existente...');
                        const { data: existingProfile } = await supabase
                            .from('profiles')
                            .select('id')
                            .eq('email', safeEmail)
                            .maybeSingle();

                        if (existingProfile) {
                            updateStep('2/5 Validando funcionario existente...');
                            const { data: existingFunc } = await supabase
                                .from('funcionarios')
                                .select('id, profiles(nombre, apellido)')
                                .eq('profile_id', existingProfile.id)
                                .maybeSingle();

                            if (existingFunc) {
                                const prof = (() => {
  const profiles = existingFunc.profiles as unknown;
  if (Array.isArray(profiles) && profiles.length > 0) {
    const p = profiles[0] as { nombre: string; apellido: string };
    return { nombre: p.nombre, apellido: p.apellido };
  }
  return { nombre: '', apellido: '' };
})();
                                const fullName = `${prof.nombre} ${prof.apellido}`.trim() || 'un funcionario activo';
                                const errorMsg = `Este correo/cédula ya está registrado y asignado a ${fullName}.`;
                                toast.error(errorMsg, { id: tid });
                                throw new Error(errorMsg);
                            }
                            profileId = existingProfile.id;
                        } else {
                            updateStep('2/5 Registrando cuenta (Auth)...');
                            const { data: authData, error: authError } = await authClient.auth.signUp({
                                email: safeEmail,
                                password: safePassword,
                                options: { data: { nombre: formData.nombre, apellido: formData.apellido } },
                            });
                            if (authError) {
                                const err = `Auth Error: ${authError.message}`;
                                toast.error(err, { id: tid });
                                throw new Error(err);
                            }
                            if (!authData.user?.identities?.length) {
                                const err = 'La cuenta ya existe o está en estado de protección (Intente de nuevo en unos minutos o reintente).';
                                toast.error(err, { id: tid });
                                throw new Error(err);
                            }
                            profileId = authData.user.id;
                        }
                    }

                    if (!profileId) {
                        const err = 'Fallo al crear ID de perfil';
                        toast.error(err, { id: tid });
                        throw new Error(err);
                    }

                    // 2. Upsert profile
                    updateStep('3/5 Sincronizando Perfil de usuario...');
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: profileId,
                            email: safeEmail,
                            rol: formData.rol,
                            nombre: formData.nombre,
                            apellido: formData.apellido,
                        }, { onConflict: 'id' });
                    if (profileError) {
                        const err = `Error Perfil: ${profileError.message}`;
                        toast.error(err, { id: tid });
                        throw new Error(err);
                    }

                    // 3. Create Funcionario record
                    updateStep('4/5 Creando Ficha de Funcionario...');
                    const { data: funcData, error: funcError } = await supabase
                        .from('funcionarios')
                        .insert({
                            profile_id: profileId,
                            cedula: formData.cedula,
                            cargo: formData.cargo,
                            departamento_id: formData.departamento_id,
                            direccion: formData.direccion,
                            fecha_ingreso: formData.fecha_ingreso,
                            tipo_contrato: formData.tipo_contrato,
                            salario_base: 0,
                            estado: formData.estado,
                        })
                        .select()
                        .single();
                    if (funcError) {
                        const err = `Error Funcionario: ${funcError.message}`;
                        toast.error(err, { id: tid });
                        throw new Error(err);
                    }

                    // Success
                    toast.success('5/5 Operación exitosa!', { id: tid });
                    return funcData;
                } catch (error) {
                    // Ensure any unexpected error also closes the loading toast
                    if (error instanceof Error) {
                        toast.error(error.message, { id: tid });
                        throw error;
                    }
                    const unknown = 'Error desconocido durante la creación';
                    toast.error(unknown, { id: tid });
                    throw new Error(unknown);
                }
            })();

            const internalTimeout = new Promise<never>((_, reject) => 
                setTimeout(() => {
                    toast.error(`Timeout interno. Se colgó en el paso: [${currentStep}]`, { id: tid });
                    reject(new Error(`Timeout interno. Se colgó en el paso: [${currentStep}]`));
                }, 18000)
            );

            return Promise.race([processPromise, internalTimeout]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
        },
    });

    const updateFuncionario = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<FuncionarioFormData> }) => {
            // 1. Get the actual funcionario row to find profile_id
            const { data: funcData, error: fetchErr } = await supabase.from('funcionarios').select('profile_id').eq('id', id).single();
            if (fetchErr) throw new Error(fetchErr.message);

            // 2. Update profile data
            if (data.nombre || data.apellido || data.rol) {
                await supabase
                    .from('profiles')
                    .update({
                        nombre: data.nombre,
                        apellido: data.apellido,
                        rol: data.rol
                    })
                    .eq('id', funcData.profile_id);
            }

            // 3. Update Funcionario data
            const updateData = { ...data };
            delete updateData.nombre;
            delete updateData.apellido;
            delete updateData.email;
            delete updateData.password;
            delete updateData.rol;

            const { data: result, error } = await supabase
                .from('funcionarios')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
        },
    });

    const resetPassword = useMutation({
        mutationFn: async ({ profileId, newPassword }: { profileId: string; newPassword: string }) => {
            const { error } = await supabase.rpc('reset_user_password', {
                target_user_id: profileId,
                new_password: newPassword
            });
            if (error) throw new Error(error.message);
            return true;
        }
    });

    return {
        getFuncionarios,
        getDepartamentos,
        createDepartamento,
        createFuncionario,
        updateFuncionario,
        resetPassword,
    };
}
