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
  clientes: {
    list: '/organizacion/clientes/',
    detail: (id: string | number) => `/organizacion/clientes/${id}/`,
  },
  users: {
    list: '/organizacion/users/',
    detail: (id: string | number) => `/organizacion/users/${id}/`,
  },
  dashboard: '/productos/dashboard/',
  products: {
    list: '/productos/productos/',
    detail: (id: string | number) => `/productos/productos/${id}/`,
  },
  lotes: {
    list: '/productos/lotes/',
    detail: (id: string | number) => `/productos/lotes/${id}/`,
  },
  categorias: {
    list: '/productos/categorias/',
    detail: (id: string | number) => `/productos/categorias/${id}/`,
  },
  marcas: {
    list: '/productos/marcas/',
    detail: (id: string | number) => `/productos/marcas/${id}/`,
  },
  equipos: {
    list: '/productos/equipos/',
    detail: (id: string | number) => `/productos/equipos/${id}/`,
  },
  proveedores: {
    list: '/productos/proveedores/',
    detail: (id: string | number) => `/productos/proveedores/${id}/`,
  },
  movimientos: {
    list: '/movimientos/movimientos/',
    detail: (id: string | number) => `/movimientos/movimientos/${id}/`,
  },
  sysvars: {
    list: '/system/configuracion/',
    detail: (id: string | number) => `/system/configuracion/${id}/`,
  },
} as const;
