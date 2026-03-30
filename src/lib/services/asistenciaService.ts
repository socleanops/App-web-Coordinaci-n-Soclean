import { supabase } from '@/lib/supabase';
import type { Asistencia } from '@/types';
import type { AsistenciaFormData } from '@/lib/validations/asistencia';

export const asistenciaService = {
  async getAsistencias(fechaDesde?: string, fechaHasta?: string): Promise<Asistencia[]> {
    let query = supabase
      .from('asistencia')
      .select(`
        id,
        funcionario_id,
        horario_id,
        fecha,
        hora_entrada_registrada,
        hora_salida_registrada,
        distancia_entrada_metros,
        distancia_salida_metros,
        estado,
        observaciones,
        created_at,
        funcionarios(
          id,
          cargo,
          profiles(nombre, apellido)
        ),
        horarios(
          id,
          dia_semana,
          hora_entrada,
          hora_salida,
          servicio_id,
          servicios(id, nombre, direccion, clientes(razon_social))
        )
      `)
      .order('fecha', { ascending: true })
      .order('funcionario_id', { ascending: true });

    if (fechaDesde && fechaHasta) {
      query = query.gte('fecha', fechaDesde).lte('fecha', fechaHasta);
    } else if (fechaDesde) {
      query = query.eq('fecha', fechaDesde);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as unknown as Asistencia[];
  },

  async createAsistencia(formData: AsistenciaFormData) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToInsert } = formData;
    const { data, error } = await supabase
      .from('asistencia')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateAsistencia(id: string, data: Partial<AsistenciaFormData>) {
    const { data: result, error } = await supabase
      .from('asistencia')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return result;
  },

  async generarPlanillaDia(fecha: string) {
    const dateObj = new Date(fecha + 'T12:00:00Z');
    const diaSemana = dateObj.getUTCDay();

    // Fetch matching schedules
    const { data: horariosRaw, error: horariosErr } = await supabase
      .from('horarios')
      .select('id, funcionario_id, vigente_desde, vigente_hasta')
      .eq('dia_semana', diaSemana)
      .lte('vigente_desde', fecha);

    if (horariosErr) throw new Error(horariosErr.message);
    
    const horarios = horariosRaw?.filter(h => !h.vigente_hasta || h.vigente_hasta >= fecha);
    if (!horarios || horarios.length === 0) return { count: 0 };

    // Check existing records
    const { data: existentes, error: extErr } = await supabase
      .from('asistencia')
      .select('horario_id')
      .eq('fecha', fecha);

    if (extErr) throw new Error(extErr.message);
    const existingHorariosMap = new Set(existentes?.map(e => e.horario_id));

    // Fetch certifications
    const { data: certs } = await supabase
      .from('certificaciones')
      .select('funcionario_id')
      .lte('fecha_inicio', fecha)
      .gte('fecha_fin', fecha);

    const certsSet = new Set(certs?.map(c => c.funcionario_id) || []);

    const nuevosRegistros = horarios
      .filter(h => !existingHorariosMap.has(h.id))
      .map(h => ({
        funcionario_id: h.funcionario_id,
        horario_id: h.id,
        fecha: fecha,
        estado: certsSet.has(h.funcionario_id) ? 'certificado' : 'pendiente'
      }));

    if (nuevosRegistros.length === 0) return { count: 0 };

    const { error: insErr } = await supabase.from('asistencia').insert(nuevosRegistros);
    if (insErr) throw new Error(insErr.message);

    return { count: nuevosRegistros.length };
  },

  async generarPlanillaSemana(desde: string, hasta: string) {
    const [horariosResult, asistenciaResult, certificacionesResult] = await Promise.all([
      supabase
        .from('horarios')
        .select('id, funcionario_id, dia_semana, vigente_desde, vigente_hasta')
        .lte('vigente_desde', hasta)
        .or(`vigente_hasta.is.null,vigente_hasta.gte.${desde}`),
      
      supabase
        .from('asistencia')
        .select('horario_id, fecha')
        .gte('fecha', desde)
        .lte('fecha', hasta),
      
      supabase
        .from('certificaciones')
        .select('funcionario_id, fecha_inicio, fecha_fin')
        .lte('fecha_inicio', hasta)
        .gte('fecha_fin', desde)
    ]);

    const { data: horariosRaw } = horariosResult;
    const { data: asistenciaRaw } = asistenciaResult;
    const { data: certificacionesRaw } = certificacionesResult;

    if (!horariosRaw || horariosRaw.length === 0) return { count: 0 };

    const existingAttendanceMap = new Map<string, Set<string>>();
    asistenciaRaw?.forEach(a => {
      if (!existingAttendanceMap.has(a.fecha)) existingAttendanceMap.set(a.fecha, new Set());
      existingAttendanceMap.get(a.fecha)!.add(a.horario_id);
    });

    const certifiedFuncionariosMap = new Map<string, Set<string>>();
    certificacionesRaw?.forEach(c => {
      const start = new Date(c.fecha_inicio);
      const end = new Date(c.fecha_fin);
      const curr = new Date(start);
      while (curr <= end) {
        const dStr = curr.toISOString().split('T')[0];
        if (!certifiedFuncionariosMap.has(dStr)) certifiedFuncionariosMap.set(dStr, new Set());
        certifiedFuncionariosMap.get(dStr)!.add(c.funcionario_id);
        curr.setDate(curr.getDate() + 1);
      }
    });

    const nuevosRegistros: any[] = [];
    const start = new Date(desde + 'T12:00:00');
    const end = new Date(hasta + 'T12:00:00');
    const curr = new Date(start);

    while (curr <= end) {
      const fStr = curr.toISOString().split('T')[0];
      const diaSemana = new Date(fStr + 'T12:00:00Z').getUTCDay();

      const horariosForDay = horariosRaw.filter(h => 
        h.dia_semana === diaSemana && 
        h.vigente_desde <= fStr && 
        (!h.vigente_hasta || h.vigente_hasta >= fStr)
      );

      const existingForDate = existingAttendanceMap.get(fStr) || new Set();
      horariosForDay.filter(h => !existingForDate.has(h.id)).forEach(h => {
        const isCertified = certifiedFuncionariosMap.get(fStr)?.has(h.funcionario_id) || false;
        nuevosRegistros.push({
          funcionario_id: h.funcionario_id,
          horario_id: h.id,
          fecha: fStr,
          estado: isCertified ? 'certificado' : 'pendiente'
        });
      });
      curr.setDate(curr.getDate() + 1);
    }

    if (nuevosRegistros.length > 0) {
      const { error } = await supabase.from('asistencia').insert(nuevosRegistros);
      if (error) throw new Error(error.message);
    }

    return { count: nuevosRegistros.length };
  }
};
