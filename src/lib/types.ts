import * as z from 'zod';

export const productoCreateSchema = z.object({
  codigo_interno: z
    .string()
    .min(1, 'El código interno es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),

  categoria: z.union([z.string(), z.number()]).nullable().optional(), // ID o nombre
  marca: z.union([z.string(), z.number()]).nullable().optional(),

  nombre_modelo: z.string().optional().nullable(),
  serie_lote: z.string().optional().nullable(),

  cantidad_disponible: z.number().min(0, 'Debe ser mayor o igual a 0').default(0),
  min_stock: z.number().min(0, 'Debe ser mayor o igual a 0').default(0),
  unidad: z.string().default('pieza'),

  proveedor: z.union([z.string(), z.number()]).nullable().optional(),
  precio_compra: z.number().nullable().optional(),
  precio_venta: z.number().nullable().optional(),

  status: z.enum(['activo', 'inactivo', 'descontinuado']).default('activo'),
  notas: z.string().nullable().optional(),
});

export const productoUpdateSchema = productoCreateSchema.partial();

export const productoResponseSchema = productoCreateSchema.extend({
  id: z.number(),
  categoria: z
    .object({
      id: z.number(),
      nombre: z.string(),
    })
    .nullable()
    .optional(),
  marca: z
    .object({
      id: z.number(),
      nombre: z.string(),
    })
    .nullable()
    .optional(),
  proveedor: z
    .object({
      id: z.number(),
      nombre: z.string(),
    })
    .nullable()
    .optional(),

  creado: z.iso.datetime(),
  actualizado: z.iso.datetime(),
});

export type ProductoCreate = z.infer<typeof productoCreateSchema>;
export type ProductoUpdate = z.infer<typeof productoUpdateSchema>;
export type ProductoResponse = z.infer<typeof productoResponseSchema>;

export const proveedorCreateSchema = z.object({
  nombre: z.string().min(1),
  nombre_contacto: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  correo: z.email().nullable().optional(),
  direccion: z.string().nullable().optional(),
  activo: z.boolean().default(true),
});
export const proveedorUpdateSchema = proveedorCreateSchema.partial();
export const proveedorResponseSchema = proveedorCreateSchema.extend({
  id: z.number(),
});

export type ProveedorCreate = z.infer<typeof proveedorCreateSchema>;
export type ProveedorUpdate = z.infer<typeof proveedorUpdateSchema>;
export type ProveedorResponse = z.infer<typeof proveedorResponseSchema>;

export const perfilUsuarioResponseSchema = z.object({
  id: z.number(),
  rol: z.enum(['admin', 'operativo', 'consulta']),
  telefono: z.string().nullable(),
  avatar: z.url().nullable(), // URL del avatar o null
  sucursales: z.array(z.number()), // lista de IDs de sucursales
});

export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.email(),
  profile: perfilUsuarioResponseSchema.nullable(), // coincide con el DRF serializer
});

export type UserResponse = z.infer<typeof userResponseSchema>;
export type PerfilUsuarioResponse = z.infer<typeof perfilUsuarioResponseSchema>;

export const clientSchema = z.object({
  nombre: z.string().min(10, 'El nombre debe tener al menos 10 caracteres.'),
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres.'),
  correo: z.string(),
  direccion: z.string(),
  rfc: z.string(),
  cliente_especial: z.boolean(),
  descuentos: z.string(),
  is_active: z.boolean(),
});

export type Cliente = z.infer<typeof clientSchema> & { id: number };

export const movimientoEntradaCreateSchema = z.object({
  producto: z.number(), // FK → Producto.id
  proveedor: z.number().nullable().optional(), // FK → Proveedor.id
  tipo_entrada: z.enum(['compra', 'devolucion', 'ajuste']).default('compra'),
  numero_factura: z.string().nullable().optional(),
  cantidad: z.number().int().positive(),
  recibido_por: z.number(), // FK → User.id
  comentarios: z.string().nullable().optional(),
});
export const movimientoEntradaUpdateSchema = movimientoEntradaCreateSchema.partial();
export const movimientoEntradaResponseSchema = movimientoEntradaCreateSchema.extend({
  id: z.number(),
  producto: productoResponseSchema,
  proveedor: proveedorResponseSchema.nullable().optional(),
  recibido_por: userResponseSchema.nullable().optional(),
  user_aprueba: userResponseSchema.nullable().optional(), // read-only en el frontend
  aprobado: z.boolean(), // read-only en el frontend
  aprobado_fecha: z.iso.datetime().nullable().optional(), // read-only en el frontend
  creado: z.iso.datetime(),
});

export type MovimientoEntradaCreate = z.infer<typeof movimientoEntradaCreateSchema>;
export type MovimientoEntradaUpdate = z.infer<typeof movimientoEntradaUpdateSchema>;
export type MovimientoEntradaResponse = z.infer<typeof movimientoEntradaResponseSchema>;

export const movimientoSalidaCreateSchema = z.object({
  producto: z.number(), // FK → Producto.id

  tipo_salida: z.enum(['project', 'rental', 'internal', 'adjustment']).default('project'),

  nombre_cliente: z.string().nullable().optional(),
  tecnico: z.string().nullable().optional(),
  equipo_asociado: z.string().nullable().optional(),

  cantidad: z.number().int().positive(),

  entregado_por: z.number(), // FK → User.id
  recibido_por: z.string().nullable().optional(),

  requiere_aprobacion: z.boolean().default(false),

  comentarios: z.string().nullable().optional(),
});

export const movimientoSalidaUpdateSchema = movimientoSalidaCreateSchema.partial();

export const movimientoSalidaResponseSchema = movimientoSalidaCreateSchema.extend({
  id: z.number(),
  producto: productoResponseSchema,
  entregado_por: userResponseSchema.nullable().optional(),
  user_aprueba: userResponseSchema.nullable().optional(),
  aprobado: z.boolean(),
  aprobado_fecha: z.iso.datetime().nullable().optional(),
  creado: z.iso.datetime(),
});

export type MovimientoSalidaCreate = z.infer<typeof movimientoSalidaCreateSchema>;
export type MovimientoSalidaUpdate = z.infer<typeof movimientoSalidaUpdateSchema>;
export type MovimientoSalidaResponse = z.infer<typeof movimientoSalidaResponseSchema>;

export type TodosMovimientosResponse = {
  entradas: MovimientoEntradaResponse[];
  salidas: MovimientoSalidaResponse[];
};

export type MovimientoUnified = {
  id: string | number;
  fecha: string;
  producto: ProductoResponse;
  tipo: 'entrada' | 'salida';
  cantidad: number; // positivo para entradas, negativo para salidas
  usuario?: string | null;
  comentarios?: string | null;
  original?: MovimientoEntradaResponse | MovimientoSalidaResponse;
};
