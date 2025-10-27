import { authStore } from '@/stores/authStore';
import * as z from 'zod';

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

export async function fetchAllClientes(): Promise<Cliente[]> {
  const { accessToken } = authStore.state;

  const response = await fetch(`http://localhost:8000/api/v1/clientes/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Network response was not ok, status: ' + response.status);
  }
  const clientes: Cliente[] = await response.json();
  return clientes;
}
