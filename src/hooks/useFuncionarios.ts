import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Funcionario } from '@/types';
import type { FuncionarioFormData } from '@/lib/validations/funcionario';
import { createClient } from '@supabase/supabase-js';
import { generateSecureRandomString } from '@/lib/utils';

// Special client that doesn't persist session, so admin can create users without being logged out
const authClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || '',
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
            return data as any;
        },
    });

    const getDepartamentos = useQuery({
        queryKey: ['departamentos'],
        queryFn: async () => {
            const { data, error } = await supabase.from('departamentos').select('*');
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
            let profileId = formData.id; // if it already exists

            const randomSuffix = generateSecureRandomString(6);
            const safeEmail = formData.email?.trim() || `ci_${formData.cedula.replace(/\D/g, '')}_${randomSuffix}@soclean.internal`;
            const safePassword = formData.password?.trim() || `SC${formData.cedula.replace(/\D/g, '')}#2026`;

            // 1. Create Auth User if it's new
            if (!profileId) {
                // Check if profile exists (recovery mode)
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', safeEmail)
                    .maybeSingle();

                if (existingProfile) {
                    // Check if they already have a funcionario
                    const { data: existingFunc } = await supabase
                        .from('funcionarios')
                        .select('id, profiles(nombre, apellido)')
                        .eq('profile_id', existingProfile.id)
                        .maybeSingle();

                    if (existingFunc) {
                        const prof = existingFunc.profiles as any;
                        const fullName = prof ? `${prof.nombre} ${prof.apellido}` : 'un funcionario activo';
                        throw new Error(`Este correo/cédula ya está registrado y asignado a ${fullName}.`);
                    }

                    // Recover the existing profile ID
                    profileId = existingProfile.id;
                } else {
                    const { data: authData, error: authError } = await authClient.auth.signUp({
                        email: safeEmail,
                        password: safePassword,
                        options: {
                            data: {
                                nombre: formData.nombre,
                                apellido: formData.apellido,
                            }
                        }
                    });

                    if (authError) throw new Error(`Auth Error: ${authError.message}`);
                    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
                        throw new Error('La cuenta ya existe o está en estado de protección (Intente de nuevo en unos minutos o reintente).');
                    }

                    profileId = authData.user?.id;
                }
            }

            if (!profileId) throw new Error('Fallo al crear ID de perfil');

            // 2. Upsert Role securely (Creates it if the DB trigger failed or doesn't exist)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: profileId,
                    email: safeEmail,
                    rol: formData.rol,
                    nombre: formData.nombre,
                    apellido: formData.apellido
                }, { onConflict: 'id' });

            if (profileError) throw new Error(`Profile Error: ${profileError.message}`);

            // 3. Create Funcionario record
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

            if (funcError) throw new Error(funcError.message);
            return funcData;
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

    return {
        getFuncionarios,
        getDepartamentos,
        createDepartamento,
        createFuncionario,
        updateFuncionario,
    };
}
