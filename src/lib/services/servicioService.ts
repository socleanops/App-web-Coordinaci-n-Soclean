import { supabase } from '@/lib/supabase';
import type { Servicio } from '@/types';
import type { ServicioFormData } from '@/lib/validations/servicio';

export const servicioService = {
  async getServicios(): Promise<Servicio[]> {
    const { data, error } = await supabase
      .from('servicios')
      .select(`
        *,
        clientes(razon_social, nombre_fantasia, nombre)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Servicio[];
  },

  async createServicio(formData: ServicioFormData) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToInsert } = formData;
    const { data, error } = await supabase
      .from('servicios')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateServicio(id: string, data: Partial<ServicioFormData>) {
    const { data: result, error } = await supabase
      .from('servicios')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  }
};
