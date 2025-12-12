import { toast } from 'sonner';

import { withAuth } from '@/lib/auth';
import { ENDPOINTS } from './endpoints';

export type DashboardData = {
  stats: {
    productos: number;
    lotes: number;
    categorias: number;
    proveedores: number;
    clientes: number;
  };
  categoriasChart: Array<{ nombre: string; cantidad: number }>;
  entradasChart: Array<{ fecha_creado: string; total: number }>;
  productosBajos: Array<{descripcion: string; categoria__nombre: string; stock: number }>;
  clientesChart: any[];
};

export const getDashboardData = async () =>
  await withAuth
    .get(ENDPOINTS.dashboard)
    .then((res) => res.data as DashboardData)
    .catch((error) => {
      toast.error(error.message);
      return {} as DashboardData;
    });
