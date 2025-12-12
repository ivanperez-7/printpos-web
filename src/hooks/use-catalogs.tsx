import { createContext, useContext, useEffect, useState } from 'react';

import { fetchCatalogs } from '@/api/catalogo';

type CatalogsProps = Awaited<ReturnType<typeof fetchCatalogs>>;

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
      setCatalogs(data);
    };
    load();
  }, []);

  return <CatalogsContext.Provider value={catalogs}>{children}</CatalogsContext.Provider>;
}
