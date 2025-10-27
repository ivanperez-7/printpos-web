import { authStore } from '@/stores/authStore';

type Producto = {
  id: number;
  codigo: 'IMP. ByN 1';
  descripcion: 'IMP. ByN 1';
  abreviado: 'Impresiones';
  categoria: 'S';
  is_active: true;
};

export async function fetchProductoById(id: number): Promise<Producto> {
  const response = await fetch(`http://localhost:8000/api/v1/productos/productos/${id}/`, {
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
