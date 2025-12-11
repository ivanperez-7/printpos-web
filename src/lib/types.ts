import * as z from 'zod';

export const clienteCreateSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  tipo: z.enum(['fisica', 'moral']).default('fisica'),
  rfc: z.string().length(13, 'El RFC debe tener 13 caracteres').optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  direccion: z.string().optional().nullable(),
  activo: z.boolean().default(true),
});
export const clienteResponseSchema = clienteCreateSchema.extend({
  id: z.number(),
});

export type ClienteCreate = z.infer<typeof clienteCreateSchema>;
export type ClienteResponse = z.infer<typeof clienteResponseSchema>;

export const categoriaCreateSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la categoría es obligatorio'),
  descripcion: z.string().nullable().optional(),
});
export const categoriaResponseSchema = categoriaCreateSchema.extend({
  id: z.number(),
});

export type CategoriaCreate = z.infer<typeof categoriaCreateSchema>;
export type CategoriaResponse = z.infer<typeof categoriaResponseSchema>;

export const marcaCreateSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la marca es obligatorio'),
  activo: z.boolean().default(true),
});
export const marcaResponseSchema = marcaCreateSchema.extend({
  id: z.number(),
});

export type MarcaCreate = z.infer<typeof marcaCreateSchema>;
export type MarcaResponse = z.infer<typeof marcaResponseSchema>;

export const equipoCreateSchema = z.object({
  nombre: z.string().min(1, 'El nombre del modelo es obligatorio'),
  marca: z.number(),
  activo: z.boolean().default(true),
});
export const equipoResponseSchema = equipoCreateSchema.extend({
  id: z.number(),
  marca: marcaResponseSchema,
});

export type EquipoCreate = z.infer<typeof equipoCreateSchema>;
export type EquipoResponse = z.infer<typeof equipoResponseSchema>;

export const proveedorCreateSchema = z.object({
  nombre: z.string().min(1),
  nombre_contacto: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  correo: z.email().nullable().optional(),
  direccion: z.string().nullable().optional(),
  activo: z.boolean().default(true),
});
export const proveedorResponseSchema = proveedorCreateSchema.extend({
  id: z.number(),
});

export type ProveedorCreate = z.infer<typeof proveedorCreateSchema>;
export type ProveedorResponse = z.infer<typeof proveedorResponseSchema>;

export const productoCreateSchema = z.object({
  codigo_interno: z
    .string()
    .min(1, 'El código interno es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),

  categoria_id: z.number(),
  equipos_id: z.array(z.number()),
  min_stock: z.number(),

  proveedor_id: z.number().nullable().optional(),
  sku: z.string().min(1, 'El SKU es obligatorio'),

  status: z.enum(['activo', 'inactivo', 'descontinuado']).default('activo'),
});

export const productoResponseSchema = productoCreateSchema.extend({
  id: z.number(),
  cantidad_disponible: z.number(),

  categoria: categoriaResponseSchema,
  equipos: z.array(equipoResponseSchema),
  proveedor: proveedorResponseSchema.nullable(),

  creado: z.iso.datetime(),
  actualizado: z.iso.datetime(),
});

export type ProductoCreate = z.infer<typeof productoCreateSchema>;
export type ProductoResponse = z.infer<typeof productoResponseSchema>;

export const loteCreateSchema = z.object({
  producto: z.number(),
  codigo_lote: z.string().min(1, 'El código de lote es obligatorio'),

  cantidad_inicial: z.number().min(1),
  cantidad_restante: z.number().min(0),

  fecha_entrada: z.iso.datetime().optional(),
});

export const loteResponseSchema = loteCreateSchema.extend({
  id: z.number(),
  creado: z.iso.datetime(),
  actualizado: z.iso.datetime(),
});

export type LoteCreate = z.infer<typeof loteCreateSchema>;
export type LoteResponse = z.infer<typeof loteResponseSchema>;

export const unidadCreateSchema = z.object({
  lote: z.number(),
  codigo_unidad: z.string().optional(),
  status: z.string().default('disponible'),
});

export const unidadResponseSchema = unidadCreateSchema.extend({
  id: z.number(),
  actualizado: z.iso.datetime(),
});

export type UnidadCreate = z.infer<typeof unidadCreateSchema>;
export type UnidadResponse = z.infer<typeof unidadResponseSchema>;

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
  profile: perfilUsuarioResponseSchema.nullable(),
  full_name: z.string(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
export type PerfilUsuarioResponse = z.infer<typeof perfilUsuarioResponseSchema>;

export const movimientoItemCreateSchema = z.object({
  producto_id: z.number(),
  cantidad: z.number().min(1),
});
export const movimientoItemResponseSchema = movimientoItemCreateSchema.extend({
  id: z.number(),
  producto: z.object({ id: z.number(), codigo_interno: z.string(), descripcion: z.string() }),
});

export type MovimientoItemCreate = z.infer<typeof movimientoItemCreateSchema>;
export type MovimientoItemResponse = z.infer<typeof movimientoItemResponseSchema>;

export const detalleEntradaCreateSchema = z.object({
  numero_factura: z.string().min(3, 'El número de factura es obligatorio'),
  recibido_por_id: z.union([z.number(), z.string()]),
});
export const detalleEntradaResponseSchema = detalleEntradaCreateSchema.extend({
  id: z.number(),
  recibido_por: z.object({ username: z.string(), first_name: z.string(), last_name: z.string() }),
});

export type DetalleEntradaCreate = z.infer<typeof detalleEntradaCreateSchema>;
export type DetalleEntradaResponse = z.infer<typeof detalleEntradaResponseSchema>;

export const detalleSalidaCreateSchema = z.object({
  cliente_id: z.number(),
  tecnico: z.string().nullable().optional(),
  requiere_aprobacion: z.boolean().default(true),
});
export const detalleSalidaResponseSchema = detalleSalidaCreateSchema.extend({
  id: z.number(),
  cliente: clienteResponseSchema,
});

export type DetalleSalidaCreate = z.infer<typeof detalleSalidaCreateSchema>;
export type DetalleSalidaResponse = z.infer<typeof detalleSalidaResponseSchema>;

export const movimientoCreateSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('entrada'),
    items: z.array(movimientoItemCreateSchema).min(1),
    detalle_entrada: detalleEntradaCreateSchema,
    comentarios: z.string().optional(),
  }),

  z.object({
    tipo: z.literal('salida'),
    items: z.array(movimientoItemCreateSchema).min(1),
    detalle_salida: detalleSalidaCreateSchema,
    comentarios: z.string().optional(),
  }),
]);

export const movimientoResponseSchema = z.object({
  id: z.number(),
  tipo: z.enum(['entrada', 'salida']),
  items: z.array(movimientoItemResponseSchema),
  detalle_entrada: detalleEntradaResponseSchema.nullable().optional(),
  detalle_salida: detalleSalidaResponseSchema.nullable(),
  creado: z.iso.datetime(),
  creado_por: z.object({ username: z.string(), first_name: z.string(), last_name: z.string() }),
  aprobado: z.boolean(),
  aprobado_fecha: z.iso.datetime().nullable(),
  user_aprueba: z
    .object({ username: z.string(), first_name: z.string(), last_name: z.string() })
    .nullable(),
  comentarios: z.string().optional(),
});

export type MovimientoCreate = z.infer<typeof movimientoCreateSchema>;
export type MovimientoResponse = z.infer<typeof movimientoResponseSchema>;

export const variableSistemaCreateSchema = z.object({
  clave: z.string().max(100, 'El nombre de la variable no puede exceder 100 caracteres.'),
  valor: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
});
export const variableSistemaResponseSchema = variableSistemaCreateSchema.extend({
  id: z.number(),
  actualizado: z.iso.datetime(),
});

export type VariableSistemaCreate = z.infer<typeof variableSistemaCreateSchema>;
export type VariableSistemaResponse = z.infer<typeof variableSistemaResponseSchema>;
