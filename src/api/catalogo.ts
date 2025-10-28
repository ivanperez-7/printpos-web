import { authStore } from '@/stores/authStore';
import { ENDPOINTS } from './endpoints';

type Producto = {
  id: number;
  codigo: 'IMP. ByN 1';
  descripcion: 'IMP. ByN 1';
  abreviado: 'Impresiones';
  categoria: 'S';
  is_active: true;
};

export async function fetchProductoById(id: number): Promise<Producto> {
  const response = await fetch(ENDPOINTS.products.detail(id), {
    headers: {
      Authorization: `Bearer ${authStore.state.accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Network response was not ok, status: ' + response.status);
  }
  const producto: Producto = await response.json();
  return producto;
}
