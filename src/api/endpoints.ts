const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export const ENDPOINTS = {
  auth: {
    login: `${API_BASE}/token/`,
    refresh: `${API_BASE}/token/refresh/`,
    logout: `${API_BASE}/logout/`,
  },
  clients: {
    list: `${API_BASE}/clientes/`,
    detail: (id: string | number) => `${API_BASE}/clientes/${id}/`,
  },
  products: {
    detail: (id: string | number) => `${API_BASE}/productos/productos/${id}/`,
  }
} as const;
