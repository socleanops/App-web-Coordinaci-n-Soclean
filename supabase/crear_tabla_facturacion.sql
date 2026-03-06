CREATE TABLE IF NOT EXISTS public.facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  numero TEXT UNIQUE NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE,
  estado TEXT CHECK (estado IN ('borrador', 'emitida', 'pagada', 'vencida', 'anulada')) DEFAULT 'borrador',
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  impuesto DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  descuento DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.factura_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factura_id UUID REFERENCES public.facturas(id) ON DELETE CASCADE NOT NULL,
  servicio_id UUID REFERENCES public.servicios(id) ON DELETE SET NULL,
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0.00
);

ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factura_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo a usuarios auth en facturas" ON public.facturas;
CREATE POLICY "Permitir todo a usuarios auth en facturas" 
ON public.facturas FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todo a usuarios auth en factura_items" ON public.factura_items;
CREATE POLICY "Permitir todo a usuarios auth en factura_items" 
ON public.factura_items FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
