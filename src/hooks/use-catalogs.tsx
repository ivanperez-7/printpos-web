import { createContext, useContext, useEffect, useState } from 'react';

import { fetchCatalogs } from '@/api/catalogo';
import type { CategoriaResponse, EquipoResponse, MarcaResponse, ProveedorResponse } from '@/lib/types';

type CatalogsProps = {
  categorias: CategoriaResponse[];
  marcas: MarcaResponse[];
  equipos: EquipoResponse[];
  proveedores: ProveedorResponse[];
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
  });

  useEffect(() => {
    const load = async () => {
      const data = await fetchCatalogs();
      setCatalogs({
        categorias: data.categorias,
        marcas: data.marcas,
        equipos: data.equipos,
        proveedores: data.proveedores,
      });
    };
    load();
  }, []);

  return <CatalogsContext.Provider value={catalogs}>{children}</CatalogsContext.Provider>;
}
