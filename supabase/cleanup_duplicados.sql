-- ============================================================
-- LIMPIEZA DE HORARIOS DUPLICADOS
-- Ejecutar en Supabase SQL Editor
-- ============================================================
-- Este script identifica horarios duplicados (mismo funcionario,
-- mismo día, mismo horario) y elimina los más nuevos, conservando
-- solo el registro original (el más antiguo por vigente_desde).
-- ============================================================

-- Paso 1: VER los duplicados antes de borrar (preview seguro)
SELECT 
    h.id,
    p.nombre || ' ' || p.apellido AS funcionario,
    h.dia_semana,
    h.hora_entrada,
    h.hora_salida,
    h.vigente_desde,
    h.created_at
FROM horarios h
JOIN funcionarios f ON f.id = h.funcionario_id
JOIN profiles p ON p.id = f.id
WHERE h.id NOT IN (
    -- Subconsulta: IDs a CONSERVAR (el más antiguo de cada grupo)
    SELECT DISTINCT ON (funcionario_id, dia_semana, hora_entrada, hora_salida, servicio_id)
        id
    FROM horarios
    ORDER BY funcionario_id, dia_semana, hora_entrada, hora_salida, servicio_id, vigente_desde ASC
)
ORDER BY p.nombre, h.dia_semana, h.hora_entrada;

-- Paso 2: ELIMINAR los duplicados (descomenta las líneas de abajo cuando estés listo)
-- DELETE FROM horarios
-- WHERE id NOT IN (
--     SELECT DISTINCT ON (funcionario_id, dia_semana, hora_entrada, hora_salida, servicio_id)
--         id
--     FROM horarios
--     ORDER BY funcionario_id, dia_semana, hora_entrada, hora_salida, servicio_id, vigente_desde ASC
-- );
