import { createContext, useContext, useEffect, useState } from 'react';

import { fetchCatalogs } from '@/api/catalogo';

type CatalogsProps = Awaited<ReturnType<typeof fetchCatalogs>>;

const CatalogsContext = createContext<
  (CatalogsProps & { reloadCatalogs: () => Promise<void> }) | undefined
>(undefined);

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

  const load = async () => {
    const data = await fetchCatalogs();
    setCatalogs(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CatalogsContext.Provider value={{ ...catalogs, reloadCatalogs: load }}>
      {children}
    </CatalogsContext.Provider>
  );
}
