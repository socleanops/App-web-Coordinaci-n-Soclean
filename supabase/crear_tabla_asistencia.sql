CREATE TABLE IF NOT EXISTS public.asistencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE CASCADE NOT NULL,
  horario_id UUID REFERENCES public.horarios(id) ON DELETE SET NULL, -- Para saber a qué turno pertenece
  fecha DATE NOT NULL,
  hora_entrada_registrada TIMESTAMP WITH TIME ZONE,
  hora_salida_registrada TIMESTAMP WITH TIME ZONE,
  distancia_entrada_metros NUMERIC, -- Para control GPS
  distancia_salida_metros NUMERIC, -- Para control GPS
  estado TEXT CHECK (estado IN ('presente', 'ausente', 'tardanza', 'salida_anticipada', 'pendiente', 'justificado')) DEFAULT 'pendiente',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.asistencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Empleados registran su asistencia" ON public.asistencia;
DROP POLICY IF EXISTS "Managers ven toda la asistencia" ON public.asistencia;
DROP POLICY IF EXISTS "Permitir todo a usuarios auth en asistencia" ON public.asistencia;

CREATE POLICY "Permitir todo a usuarios auth en asistencia" 
ON public.asistencia FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
