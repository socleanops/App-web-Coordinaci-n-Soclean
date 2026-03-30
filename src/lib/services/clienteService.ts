import { supabase } from '@/lib/supabase';
import type { Cliente } from '@/types';
import type { ClienteFormData } from '@/lib/validations/cliente';

export const clienteService = {
  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        id,
        razon_social,
        nombre,
        nombre_fantasia,
        rut,
        direccion,
        contacto_principal,
        frecuencia_visita,
        carga_horaria,
        telefono,
        email,
        estado,
        created_at
      `)
      .order('razon_social', { ascending: true });

    if (error) throw new Error(error.message);
    return data as Cliente[];
  },

  async createCliente(formData: ClienteFormData) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToInsert } = formData;
    const payload = { ...dataToInsert, nombre: dataToInsert.razon_social };
    const { data, error } = await supabase
      .from('clientes')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateCliente(id: string, data: Partial<ClienteFormData>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = { ...data };
    if (payload.razon_social) {
      payload.nombre = payload.razon_social;
    }
    const { data: result, error } = await supabase
      .from('clientes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  },

  async deleteCliente(id: string) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
};
