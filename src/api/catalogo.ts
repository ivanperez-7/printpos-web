import { redirect } from '@tanstack/react-router';
import { toast } from 'sonner';

import { withAuth } from '@/lib/auth';
import type {
  CategoriaResponse,
  EquipoResponse,
  LoteResponse,
  MarcaResponse,
  ProductoResponse,
  ProveedorResponse,
  MovimientoResponse,
} from '@/lib/types';
import { ENDPOINTS } from './endpoints';

export const fetchAllProductos = async () =>
  await withAuth
    .get(ENDPOINTS.products.list)
    .then((res) => res.data as ProductoResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });

export const fetchProductoById = async (id: number) => {
  const producto = await withAuth
    .get(ENDPOINTS.products.detail(id))
    .then((res) => res.data as ProductoResponse)
    .catch(() => {
      throw redirect({ to: '/catalogo' });
    });

  const movimientos = await withAuth
    .get(ENDPOINTS.movimientos.list, { params: { items__producto: id } })
    .then((res) => res.data as MovimientoResponse[])
    .catch((error) => {
      toast.error(error.message);
      return [];
    });

  const lotes = await withAuth
    .get(ENDPOINTS.lotes.list, { params: { producto: id } })
    .then((res) => res.data as LoteResponse[])
    .catch((error) => {
      toast.error(error.message);
      return [] as LoteResponse[];
    });

  return { producto, movimientos, lotes };
};

export const fetchCatalogs = async () => {
  const categorias = await withAuth
    .get(ENDPOINTS.categorias.list)
    .then((res) => res.data as CategoriaResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });

  const marcas = await withAuth
    .get(ENDPOINTS.marcas.list)
    .then((res) => res.data as MarcaResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });

  const equipos = await withAuth
    .get(ENDPOINTS.equipos.list)
    .then((res) => res.data as EquipoResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });

  const proveedores = await withAuth
    .get(ENDPOINTS.proveedores.list)
    .then((res) => res.data as ProveedorResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });

  return { categorias, marcas, equipos, proveedores };
};
