import { withAuth } from '@/lib/auth';
import { ENDPOINTS } from './endpoints';
import { redirect } from '@tanstack/react-router';
import type { ProductoResponse, TodosMovimientosResponse } from '@/lib/types';
import { toast } from 'sonner';

export const fetchAllProductos = async (): Promise<ProductoResponse[]> =>
  withAuth
    .get(ENDPOINTS.products.list)
    .then((res) => res.data)
    .then((data) => data as ProductoResponse[])
    .catch(() => {
      throw redirect({ to: '/catalogo' });
    });

export const fetchProductoById = async (id: number) => {
  const producto = await withAuth
    .get(ENDPOINTS.products.detail(id))
    .then((res) => res.data)
    .then((data) => data as ProductoResponse)
    .catch(() => {
      throw redirect({ to: '/catalogo' });
    });

  const movimientos = await withAuth
    .get(ENDPOINTS.movimientos.all, { params: { producto: id } })
    .then((res) => res.data)
    .then((data) => data as TodosMovimientosResponse)
    .catch((error) => {
      toast.error(error.message);
      return { entradas: [], salidas: [] };
    });

  return { producto, movimientos };
};
