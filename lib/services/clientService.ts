import { supabase } from '../../src/lib/supabase';
import type { Cliente } from '../../src/types';

export async function getClients(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('razon_social', { ascending: true });

  if (error) {
    throw new Error(`Error fetching clients: ${error.message}`);
  }

  return data || [];
}

export async function createClient(clientData: Partial<Cliente>): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .insert([clientData])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating client: ${error.message}`);
  }

  return data;
}
