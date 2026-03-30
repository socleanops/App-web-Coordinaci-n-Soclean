import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { generateSecureRandomString } from '@/lib/utils';
import type { Funcionario } from '@/types';
import type { FuncionarioFormData } from '@/lib/validations/funcionario';

// Special client that doesn't persist session, so admin can create users without being logged out
const authClient = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const funcionarioService = {
  async getFuncionarios(): Promise<Funcionario[]> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select(`
        *,
        profiles(*),
        departamentos(nombre)
      `)
      .order('fecha_ingreso', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Funcionario[];
  },

  async getDepartamentos() {
    const { data, error } = await supabase.from('departamentos').select('id, nombre');
    if (error) throw new Error(error.message);
    return data;
  },

  async createDepartamento(nombre: string) {
    const { data, error } = await supabase.from('departamentos').insert({ nombre }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Complex onboarding logic: Auth User -> Profile -> Funcionario
   */
  async createFuncionario(formData: FuncionarioFormData, onStepChange?: (step: string) => void) {
    let profileId = formData.id;
    let isNewAccount = false;

    const randomSuffix = generateSecureRandomString(6);
    const safeEmail = formData.email?.trim() || `ci_${formData.cedula.replace(/\D/g, '')}_${randomSuffix}@soclean.internal`;
    const safePassword = formData.password?.trim() || `SC${formData.cedula.replace(/\D/g, '')}#2026`;

    // 1. Create Auth User if needed
    if (!profileId) {
      onStepChange?.('2/5 Buscando perfil existente...');
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', safeEmail)
        .maybeSingle();

      if (existingProfile) {
        onStepChange?.('2/5 Validando funcionario existente...');
        const { data: existingFunc } = await supabase
          .from('funcionarios')
          .select('id, profiles(nombre, apellido)')
          .eq('profile_id', existingProfile.id)
          .maybeSingle();

        if (existingFunc) {
            // Handle profile extraction for error message
            const profiles = existingFunc.profiles;
            const prof = Array.isArray(profiles) ? profiles[0] : profiles;
            const fullName = `${prof?.nombre || ''} ${prof?.apellido || ''}`.trim() || 'un funcionario activo';
            throw new Error(`Este correo/cédula ya está registrado y asignado a ${fullName}.`);
        }
        profileId = existingProfile.id;
      } else {
        onStepChange?.('2/5 Registrando cuenta (Auth)...');
        const { data: authData, error: authError } = await authClient.auth.signUp({
          email: safeEmail,
          password: safePassword,
          options: { data: { nombre: formData.nombre, apellido: formData.apellido } },
        });

        if (authError) throw new Error(`Auth Error: ${authError.message}`);
        if (!authData.user?.identities?.length) {
          throw new Error('La cuenta ya existe o está en estado de protección.');
        }
        profileId = authData.user.id;
        isNewAccount = true;
      }
    }

    if (!profileId) throw new Error('Fallo al crear ID de perfil');

    try {
      // 2. Upsert profile
      onStepChange?.('3/5 Sincronizando Perfil de usuario...');
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: profileId,
          email: safeEmail,
          rol: formData.rol,
          nombre: formData.nombre,
          apellido: formData.apellido,
        }, { onConflict: 'id' });
      
      if (profileError) throw profileError;

      // 3. Create Funcionario record
      onStepChange?.('4/5 Creando Ficha de Funcionario...');
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

      if (funcError) throw funcError;

      return funcData;
    } catch (error: unknown) {
      if (isNewAccount && profileId) {
        // Rollback sintético para purgar la cuenta de Auth que acabamos de crear exitosamente
        await supabase.rpc('delete_auth_user', { target_user_id: profileId });
      }
      const errMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Fallo en la creación del funcionario: ${errMessage}`);
    }
  },

  async updateFuncionario(id: string, data: Partial<FuncionarioFormData>) {
    // 1. Get the actual funcionario row to find profile_id
    const { data: funcData, error: fetchErr } = await supabase.from('funcionarios').select('profile_id').eq('id', id).single();
    if (fetchErr) throw new Error(fetchErr.message);

    // 2. Update profile data
    if (data.nombre || data.apellido || data.rol) {
      const { error: profErr } = await supabase
        .from('profiles')
        .update({
          nombre: data.nombre,
          apellido: data.apellido,
          rol: data.rol
        })
        .eq('id', funcData.profile_id);
      if (profErr) throw new Error(profErr.message);
    }

    // 3. Update Funcionario data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { nombre, apellido, email, password, rol, ...updatePayload } = data;

    const { data: result, error } = await supabase
      .from('funcionarios')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  },

  async resetPassword(profileId: string, newPassword: string) {
    const { error } = await supabase.rpc('reset_user_password', {
      target_user_id: profileId,
      new_password: newPassword
    });
    if (error) throw new Error(error.message);
    return true;
  },

  async deleteFuncionario(id: string) {
    // 1. Get profile_id first
    const { data: func, error: fetchErr } = await supabase.from('funcionarios').select('profile_id').eq('id', id).single();
    if (fetchErr) throw new Error(fetchErr.message);

    // 2. Delete from funcionarios (Cascade might handle it if set, but let's be explicit)
    const { error: funcErr } = await supabase.from('funcionarios').delete().eq('id', id);
    if (funcErr) throw new Error(funcErr.message);

    // 3. Delete profile and auth credentials via RPC
    if (func.profile_id) {
      const { error: profErr } = await supabase.rpc('delete_auth_user', { target_user_id: func.profile_id });
      if (profErr) console.warn('Perfil Auth no pudo ser eliminado (podría estar bloqueado o ya borrado):', profErr.message);
    }

    return true;
  }
};
