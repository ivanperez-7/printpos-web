import * as z from 'zod';

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
  descripcion: z.string().nullable().optional(),
});
export const marcaResponseSchema = marcaCreateSchema.extend({
  id: z.number(),
});

export type MarcaCreate = z.infer<typeof marcaCreateSchema>;
export type MarcaResponse = z.infer<typeof marcaResponseSchema>;

export const equipoCreateSchema = z.object({
  nombre: z.string().min(1, 'El nombre del modelo es obligatorio'),
  descripcion: z.string().nullable().optional(),
  marca: z.number(),
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

  categoria: z.number(),
  equipo: z.number(),
  min_stock: z.number(),

  proveedor: z.number().nullable().optional(),
  sku: z.string().min(1, 'El SKU es obligatorio'),

  unidad_medida: z.string().default('pieza'),
  status: z.enum(['activo', 'inactivo', 'descontinuado']).default('activo'),
});

export const productoResponseSchema = productoCreateSchema.extend({
  id: z.number(),
  cantidad_disponible: z.number(),

  categoria: categoriaResponseSchema,
  equipo: equipoResponseSchema,
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
  profile: perfilUsuarioResponseSchema.nullable(), // coincide con el DRF serializer
});

export type UserResponse = z.infer<typeof userResponseSchema>;
export type PerfilUsuarioResponse = z.infer<typeof perfilUsuarioResponseSchema>;

export const entradaItemCreateSchema = z.object({
  producto: z.number(), // FK → Producto.id
  cantidad: z.number().int().positive(),
});
export const entradaItemResponseSchema = entradaItemCreateSchema.extend({
  id: z.number(),
  producto: productoResponseSchema, // objeto completo
});

export type EntradaItemCreate = z.infer<typeof entradaItemCreateSchema>;
export type EntradaItemResponse = z.infer<typeof entradaItemResponseSchema>;

export const movimientoEntradaCreateSchema = z.object({
  tipo_entrada: z.enum(['compra', 'devolucion', 'ajuste']).default('compra'),
  numero_factura: z.string(),

  recibido_por: z.number(), // FK → User.id

  comentarios: z.string().nullable().optional(),

  items: z.array(entradaItemCreateSchema).min(1, 'Debe tener al menos un item'),
});

export const movimientoEntradaResponseSchema = movimientoEntradaCreateSchema.extend({
  id: z.number(),

  recibido_por: userResponseSchema.nullable().optional(),
  user_aprueba: userResponseSchema.nullable().optional(),

  aprobado: z.boolean(),
  aprobado_fecha: z.iso.datetime().nullable().optional(),
  creado: z.iso.datetime(),

  items: z.array(entradaItemResponseSchema),
});

export type MovimientoEntradaCreate = z.infer<typeof movimientoEntradaCreateSchema>;
export type MovimientoEntradaResponse = z.infer<typeof movimientoEntradaResponseSchema>;

export const salidaItemCreateSchema = z.object({
  producto: z.number(),
  cantidad: z.number().int().positive(),
});
export const salidaItemResponseSchema = salidaItemCreateSchema.extend({
  id: z.number(),
  producto: productoResponseSchema,
});

export type SalidaItemCreate = z.infer<typeof salidaItemCreateSchema>;
export type SalidaItemResponse = z.infer<typeof salidaItemResponseSchema>;

export const movimientoSalidaCreateSchema = z.object({
  tipo_salida: z.enum(['project', 'rental', 'internal', 'adjustment']).default('project'),

  nombre_cliente: z.string(),
  tecnico: z.string().nullable().optional(),

  entregado_por: z.number(),
  recibido_por: z.string().nullable().optional(),

  requiere_aprobacion: z.boolean().default(false),

  comentarios: z.string().nullable().optional(),

  items: z.array(salidaItemCreateSchema).min(1, 'Debe tener al menos un item'),
});

export const movimientoSalidaResponseSchema = movimientoSalidaCreateSchema.extend({
  id: z.number(),

  entregado_por: userResponseSchema.nullable().optional(),
  user_aprueba: userResponseSchema.nullable().optional(),

  aprobado: z.boolean(),
  aprobado_fecha: z.iso.datetime().nullable().optional(),
  creado: z.iso.datetime(),

  items: z.array(salidaItemResponseSchema),
});

export type MovimientoSalidaCreate = z.infer<typeof movimientoSalidaCreateSchema>;
export type MovimientoSalidaResponse = z.infer<typeof movimientoSalidaResponseSchema>;

export type TodosMovimientosResponse = {
  entradas: MovimientoEntradaResponse[];
  salidas: MovimientoSalidaResponse[];
};

export type MovimientoUnified = {
  id: number | string;
  fecha: string;
  tipo: 'entrada' | 'salida';
  usuario?: string | null;
  comentarios?: string | null;
  original?: MovimientoEntradaResponse | MovimientoSalidaResponse;
};

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
