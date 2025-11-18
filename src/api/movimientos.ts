import { withAuth } from '@/lib/auth';
import { ENDPOINTS } from './endpoints';
import { toast } from 'sonner';
import type { ProductoResponse, TodosMovimientosResponse } from '@/lib/types';

export async function fetchMovimientos() {
  const productos = await withAuth
    .get(ENDPOINTS.products.list)
    .then((res) => res.data)
    .then((data) => data as ProductoResponse[])
    .catch((error) => {
      toast.error(error.message);
      return [];
    });

  const movimientos = await withAuth
    .get(ENDPOINTS.movimientos.all)
    .then((res) => res.data)
    .then((data) => data as TodosMovimientosResponse)
    .catch((error) => {
      toast.error(error.message);
      return { entradas: [], salidas: [] };
    });

  return { productos, movimientos };
}
