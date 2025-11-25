import { withAuth } from '@/lib/auth';
import { ENDPOINTS } from './endpoints';
import { redirect } from '@tanstack/react-router';
import type {
  CategoriaResponse,
  EquipoResponse,
  ProductoResponse,
  ProveedorResponse,
  TodosMovimientosResponse,
} from '@/lib/types';
import { toast } from 'sonner';

export const fetchAllProductos = async () => {
  const productos = await withAuth
    .get(ENDPOINTS.products.list)
    .then((res) => res.data)
    .then((data) => data as ProductoResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });

  const categorias = await withAuth
    .get(ENDPOINTS.categorias.list)
    .then((res) => res.data)
    .then((data) => data as CategoriaResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });

  const equipos = await withAuth
    .get(ENDPOINTS.equipos.list)
    .then((res) => res.data)
    .then((data) => data as EquipoResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });

  const proveedores = await withAuth
    .get(ENDPOINTS.proveedores.list)
    .then((res) => res.data)
    .then((data) => data as ProveedorResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });

  return { productos, categorias, equipos, proveedores };
};

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
