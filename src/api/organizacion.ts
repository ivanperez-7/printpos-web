import type { SucursalResponse } from '@/lib/types';
import axios from 'axios';
import { API_BASE, ENDPOINTS } from './endpoints';

export const getSucursales = async () =>
  axios
    .get(ENDPOINTS.sucursales.list, { baseURL: API_BASE })
    .then((response) => response.data as SucursalResponse[])
    .catch((error) => {
      throw new Error(error.message);
    });
