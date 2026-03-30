-- Migration: rpc_crear_factura
-- Objective: Atomic transaction for Invoice and Invoice Items creation

CREATE OR REPLACE FUNCTION crear_factura_con_items(
    factura_data JSONB,
    items_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    nueva_factura RECORD;
BEGIN
    -- 1. Insert Factura
    INSERT INTO facturas (
        cliente_id, 
        numero, 
        fecha_emision, 
        fecha_vencimiento, 
        periodo, 
        estado, 
        subtotal, 
        impuesto, 
        descuento, 
        total
    ) VALUES (
        (factura_data->>'cliente_id')::UUID,
        factura_data->>'numero',
        (factura_data->>'fecha_emision')::DATE,
        (NULLIF(factura_data->>'fecha_vencimiento', ''))::DATE,
        NULLIF(factura_data->>'periodo', ''),
        factura_data->>'estado',
        (factura_data->>'subtotal')::NUMERIC,
        (factura_data->>'impuesto')::NUMERIC,
        (factura_data->>'descuento')::NUMERIC,
        (factura_data->>'total')::NUMERIC
    )
    RETURNING * INTO nueva_factura;

    -- 2. Insert Items if they exist
    IF items_data IS NOT NULL AND jsonb_typeof(items_data) = 'array' AND jsonb_array_length(items_data) > 0 THEN
        INSERT INTO factura_items (factura_id, servicio_id, descripcion, cantidad, precio_unitario, total)
        SELECT 
            nueva_factura.id,
            (NULLIF(item->>'servicio_id', ''))::UUID,
            item->>'descripcion',
            (item->>'cantidad')::NUMERIC,
            (item->>'precio_unitario')::NUMERIC,
            (item->>'total')::NUMERIC
        FROM jsonb_array_elements(items_data) AS item;
    END IF;

    -- Return the inserted factura as JSON
    RETURN to_jsonb(nueva_factura);
END;
$$;
