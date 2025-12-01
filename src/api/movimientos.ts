import { toast } from 'sonner';

import { withAuth } from '@/lib/auth';
import type { TodosMovimientosResponse } from '@/lib/types';
import { ENDPOINTS } from './endpoints';

export const fetchMovimientos = async () =>
  await withAuth
    .get(ENDPOINTS.movimientos.all)
    .then((res) => res.data as TodosMovimientosResponse)
    .catch((error) => {
      toast.error(error.message);
      return { entradas: [], salidas: [] };
    });
