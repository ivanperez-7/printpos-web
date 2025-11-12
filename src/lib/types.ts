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
