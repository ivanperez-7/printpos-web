import { withAuth } from '@/lib/auth';
import { ENDPOINTS } from './endpoints';
import { toast } from 'sonner';

type Producto = {
  id: number;
  codigo: 'IMP. ByN 1';
  descripcion: 'IMP. ByN 1';
  abreviado: 'Impresiones';
  categoria: 'S';
  is_active: true;
};

export const fetchProductoById = async (id: number): Promise<Producto> =>
  withAuth
    .get(ENDPOINTS.products.detail(id))
    .then((res) => res.data)
    .then((data) => data as Producto)
    .catch((error) => {
      toast.error(error.message);
      throw error
    });
