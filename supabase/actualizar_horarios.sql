-- Agregar relación con servicio al horario para saber dónde trabaja el empleado
ALTER TABLE public.horarios
ADD COLUMN servicio_id UUID REFERENCES public.servicios(id) ON DELETE CASCADE;

-- Crear políticas para permitir manejo temporal
DROP POLICY IF EXISTS "Managers ven todos los horarios" ON public.horarios;
DROP POLICY IF EXISTS "Funcionario solo ve su horario" ON public.horarios;

CREATE POLICY "Permitir todo a usuarios activos en horarios" 
ON public.horarios FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
