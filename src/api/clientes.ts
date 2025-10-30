import { withAuth } from '@/lib/auth';
import { toast } from 'sonner';
import * as z from 'zod';
import { ENDPOINTS } from './endpoints';

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

export type Cliente = z.infer<typeof clientSchema>;

export const fetchAllClientes = async (): Promise<Cliente[]> =>
  withAuth
    .get(ENDPOINTS.clients.list)
    .then((res) => res.data)
    .then((data) => data as Cliente[])
    .catch((error) => {
      toast.error(error.message);
      return [];
    });
