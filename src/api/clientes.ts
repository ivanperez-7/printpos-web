import { withAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { ENDPOINTS } from './endpoints';
import type { Cliente } from '@/lib/types';

export const fetchAllClientes = async (): Promise<Cliente[]> =>
  withAuth
    .get(ENDPOINTS.clients.list)
    .then((res) => res.data)
    .then((data) => data as Cliente[])
    .catch((error) => {
      toast.error(error.message);
      return [];
    });
