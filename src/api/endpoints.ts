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
    list: '/productos/productos/',
    detail: (id: string | number) => `/productos/productos/${id}/`,
  },
  lotes: {
    list: '/productos/lotes/',
  },
  categorias: {
    list: '/productos/categorias/',
  },
  marcas: {
    list: '/productos/marcas/',
  },
  equipos: {
    list: '/productos/equipos/',
  },
  proveedores: {
    list: '/productos/proveedores/'
  },
  movimientos: {
    all: '/movimientos/main-table/',
    entradas: {
      list: '/movimientos/entradas/',
      detail: (id: string | number) => `/movimientos/entradas/${id}/`,
    },
    salidas: {
      list: '/movimientos/salidas/',
      detail: (id: string | number) => `/movimientos/salidas/${id}/`,
    }
  },
  sysvars: {
    list: '/system/configuracion/',
    detail: (id: string | number) => `/system/configuracion/${id}/`
  }
} as const;
