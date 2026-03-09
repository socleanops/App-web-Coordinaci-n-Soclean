export type Profile = {
    id: string; // uuid from auth.users
    nombre: string;
    apellido: string;
    email: string;
    rol: 'superadmin' | 'admin' | 'supervisor' | 'facturador' | 'funcionario';
    avatar_url?: string;
    activo: boolean;
};

export type Departamento = {
    id: string;
    nombre: string;
    descripcion?: string;
};

export type Funcionario = {
    id: string;
    profile_id: string;
    cedula: string;
    cargo: string;
    departamento_id: string;
    direccion: string;
    fecha_ingreso: string; // date string
    tipo_contrato: string;
    salario_base: number;
    estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia';
    profiles?: Profile; // Joined data
    departamentos?: Departamento; // Joined data
};

export type Cliente = {
    id: string;
    razon_social: string;
    nombre?: string;
    nombre_fantasia?: string;
    rut: string;
    direccion: string;
    telefono?: string;
    email?: string;
    contacto_principal?: string;
    frecuencia_visita?: string;
    carga_horaria?: string;
    estado: 'activo' | 'inactivo';
    created_at?: string;
};

export type Servicio = {
    id: string;
    cliente_id: string;
    nombre: string;
    descripcion?: string;
    direccion: string;
    estado: 'activo' | 'inactivo';
    created_at?: string;
    clientes?: Cliente; // Joined data
};

export type Horario = {
    id: string;
    funcionario_id: string;
    servicio_id: string;
    dia_semana: number;
    hora_entrada: string;
    hora_salida: string;
    vigente_desde: string; // date string
    vigente_hasta?: string; // date string
    created_at?: string;
    funcionarios?: Funcionario; // Joined data
    servicios?: Servicio; // Joined data
};

export type Asistencia = {
    id: string;
    funcionario_id: string;
    horario_id?: string;
    fecha: string; // date string YYYY-MM-DD
    hora_entrada_registrada?: string; // ISO DB string
    hora_salida_registrada?: string; // ISO DB string
    distancia_entrada_metros?: number;
    distancia_salida_metros?: number;
    estado: 'presente' | 'ausente' | 'tardanza' | 'salida_anticipada' | 'pendiente' | 'justificado';
    observaciones?: string;
    created_at?: string;
    funcionarios?: Funcionario; // Joined data
    horarios?: Horario; // Joined data
};

export type Factura = {
    id: string;
    cliente_id?: string;
    numero: string;
    fecha_emision: string; // date string
    fecha_vencimiento?: string; // date string
    estado: 'borrador' | 'emitida' | 'pagada' | 'vencida' | 'anulada';
    subtotal: number;
    impuesto: number;
    descuento: number;
    total: number;
    created_at?: string;
    updated_at?: string;
    clientes?: Cliente; // Joined Data
    items?: FacturaItem[]; // Joined Data
};

export type FacturaItem = {
    id: string;
    factura_id: string;
    servicio_id?: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
    servicios?: Servicio; // Joined Data
};
