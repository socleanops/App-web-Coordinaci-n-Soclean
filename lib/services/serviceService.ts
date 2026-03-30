import { supabase } from '../../src/lib/supabase';
import type { Servicio } from '../../src/types';

export async function createService(serviceData: Partial<Servicio>): Promise<Servicio> {
  const { data, error } = await supabase
    .from('servicios')
    .insert([serviceData])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating service: ${error.message}`);
  }

  return data;
}
