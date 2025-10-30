export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export const ENDPOINTS = {
  auth: {
    login: '/token/',
    refresh: '/token/refresh/',
    logout: '/logout/',
  },
  clients: {
    list: '/clientes/',
    detail: (id: string | number) => `/clientes/${id}/`,
  },
  products: {
    detail: (id: string | number) => `/productos/productos/${id}/`,
  },
} as const;
