import { toast } from 'sonner';

import { withAuth } from '@/lib/auth';
import type {
  MovimientoEntradaResponse,
  MovimientoSalidaResponse,
  TodosMovimientosResponse,
} from '@/lib/types';
import { ENDPOINTS } from './endpoints';

export const fetchMovimientos = async () =>
  await withAuth
    .get(ENDPOINTS.movimientos.all)
    .then((res) => res.data as TodosMovimientosResponse)
    .catch((error) => {
      toast.error(error.message);
      return { entradas: [], salidas: [] };
    });

export const fetchMovEntradaById = async (id: number | string) =>
  await withAuth
    .get(ENDPOINTS.movimientos.entradas.detail(id))
    .then((res) => res.data as MovimientoEntradaResponse)
    .catch((error) => {
      toast.error(error.message);
      return {};
    });

export const fetchMovSalidaById = async (id: number | string) =>
  await withAuth
    .get(ENDPOINTS.movimientos.salidas.detail(id))
    .then((res) => res.data as MovimientoSalidaResponse)
    .catch((error) => {
      toast.error(error.message);
      return {};
    });
