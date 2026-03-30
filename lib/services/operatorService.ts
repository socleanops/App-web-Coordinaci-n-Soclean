import { supabase } from '../../src/lib/supabase';
import type { Profile } from '../../src/types';

export async function getOperators(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('rol', ['supervisor', 'funcionario'])
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(`Error fetching operators: ${error.message}`);
  }

  return data || [];
}
