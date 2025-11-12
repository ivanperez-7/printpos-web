import { withAuth } from '@/lib/auth';
import { ENDPOINTS } from './endpoints';
import { redirect } from '@tanstack/react-router';
import type { Producto } from '@/lib/types';

export const fetchAllProductos = async () : Promise<Producto[]> => 
  withAuth
    .get(ENDPOINTS.products.list)
    .then((res) => res.data)
    .then((data) => data as Producto[])
    .catch(() => {
      throw redirect({ to: '/catalogo' });
    });

export const fetchProductoById = async (id: number): Promise<Producto> =>
  withAuth
    .get(ENDPOINTS.products.detail(id))
    .then((res) => res.data)
    .then((data) => data as Producto)
    .catch(() => {
      throw redirect({ to: '/catalogo' });
    });
