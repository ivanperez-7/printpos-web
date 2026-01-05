import { toast } from 'sonner';

import { withAuth } from '@/lib/auth';
import type { MovimientoResponse } from '@/lib/types';
import { ENDPOINTS } from './endpoints';

export const fetchMovimientos = async () =>
  await withAuth
    .get(ENDPOINTS.movimientos.list)
    .then((res) => res.data as MovimientoResponse[])
    .catch((error) => {
      toast.error(error.message);
      return [];
    });

export const fetchMovimientoById = async (id: string | number) =>
  await withAuth
    .get(ENDPOINTS.movimientos.detail(id))
    .then((res) => res.data as MovimientoResponse)
    .catch((error) => {
      toast.error(error.message);
      return {} as MovimientoResponse;
    });
