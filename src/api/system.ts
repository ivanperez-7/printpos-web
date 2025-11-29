import { withAuth } from '@/lib/auth';
import type { VariableSistemaResponse } from '@/lib/types';
import { ENDPOINTS } from './endpoints';

export const fetchAllSysvars = async () =>
  await withAuth
    .get(ENDPOINTS.sysvars.list)
    .then((res) => res.data as VariableSistemaResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });
