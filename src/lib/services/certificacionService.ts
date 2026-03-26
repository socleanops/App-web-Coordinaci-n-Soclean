import { supabase } from '@/lib/supabase';
import type { Certificacion } from '@/types';
import type { CertificacionFormData } from '@/lib/validations/certificacion';

export const certificacionService = {
  async getCertificaciones(funcionarioId: string): Promise<Certificacion[]> {
    const { data, error } = await supabase
      .from('certificaciones')
      .select('id, funcionario_id, fecha_inicio, fecha_fin, motivo')
      .eq('funcionario_id', funcionarioId)
      .order('fecha_inicio', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Certificacion[];
  },

  async getAllCertificaciones(): Promise<Certificacion[]> {
    const { data, error } = await supabase
      .from('certificaciones')
      .select('id, funcionario_id, fecha_inicio, fecha_fin, motivo')
      .order('fecha_inicio', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Certificacion[];
  },

  async createCertificacion(formData: CertificacionFormData) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToInsert } = formData;

    // 1. Insert into certificaciones
    const { data: cert, error: certErr } = await supabase
      .from('certificaciones')
      .insert(dataToInsert)
      .select()
      .single();

    if (certErr) throw new Error(certErr.message);

    // 2. Update existing attendance records overlapping the dates
    // This is business logic that ensures data consistency
    const { error: asistErr } = await supabase
      .from('asistencia')
      .update({ estado: 'certificado' })
      .eq('funcionario_id', formData.funcionario_id)
      .in('estado', ['pendiente', 'ausente', 'no_citado'])
      .gte('fecha', formData.fecha_inicio)
      .lte('fecha', formData.fecha_fin);

    if (asistErr) {
      console.warn("Failed to auto-update attendance:", asistErr);
    }

    return cert;
  },

  async deleteCertificacion(id: string) {
    const { error } = await supabase.from('certificaciones').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
};
