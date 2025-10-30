import { withAuth } from '@/lib/auth';
import { ENDPOINTS } from './endpoints';
import { redirect } from '@tanstack/react-router';

type Producto = {
  id: number;
  codigo: 'IMP. ByN 1';
  descripcion: 'IMP. ByN 1';
  abreviado: 'Impresiones';
  categoria: 'S';
  is_active: true;
};

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
