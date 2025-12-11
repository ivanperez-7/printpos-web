import { createContext, useContext, useEffect, useState } from 'react';

import { fetchCatalogs } from '@/api/catalogo';
import type {
  CategoriaResponse,
  ClienteResponse,
  EquipoResponse,
  MarcaResponse,
  ProveedorResponse,
  UserResponse,
} from '@/lib/types';

type CatalogsProps = {
  categorias: CategoriaResponse[];
  marcas: MarcaResponse[];
  equipos: EquipoResponse[];
  proveedores: ProveedorResponse[];
  users: UserResponse[];
  clientes: ClienteResponse[];
};

const CatalogsContext = createContext<CatalogsProps | undefined>(undefined);

export function useCatalogs() {
  const ctx = useContext(CatalogsContext);
  if (!ctx) throw new Error('useCatalogs must be used inside a CatalogsProvider.');
  return ctx;
}

export function CatalogsProvider({ children }: React.PropsWithChildren) {
  const [catalogs, setCatalogs] = useState<CatalogsProps>({
    categorias: [],
    marcas: [],
    equipos: [],
    proveedores: [],
    users: [],
    clientes: [],
  });

  useEffect(() => {
    const load = async () => {
      const data = await fetchCatalogs();
      setCatalogs({
        categorias: data.categorias,
        marcas: data.marcas,
        equipos: data.equipos,
        proveedores: data.proveedores,
        users: data.users,
        clientes: data.clientes,
      });
    };
    load();
  }, []);

  return <CatalogsContext.Provider value={catalogs}>{children}</CatalogsContext.Provider>;
}
