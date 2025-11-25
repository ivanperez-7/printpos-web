import { createFileRoute, Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Package2, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// COMPONENTES DEL PROYECTO
import { AddProductDialog } from '@/components/add-product-dialog';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

// OTRAS UTILIDADES
import { fetchAllProductos as fetchAllProductosAndCatalogs } from '@/api/catalogo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductoResponse } from '@/lib/types';
import { useHeader } from '@/components/site-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const columns: ColumnDef<ProductoResponse>[] = [
  {
    accessorKey: 'codigo_interno',
    header: 'Código',
    cell: ({ row }) => (
      <Link to='/catalogo/$id' params={{ id: String(row.original.id) }}>
        {row.getValue('codigo_interno')}
      </Link>
    ),
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
  },
  {
    accessorKey: 'equipo.marca.nombre',
    header: 'Marca',
  },
  {
    accessorKey: 'equipo.nombre',
    header: 'Equipo',
  },
  {
    accessorKey: 'cantidad_disponible',
    header: 'Existencia',
    cell: ({ row }) => (
      <span>
        {row.getValue('cantidad_disponible')} {row.original.unidad}
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'cantidad_disponible',
    header: 'Estado',
    cell: ({ row }) => (
      <span className='inline-flex items-center gap-2'>
        {statusFromStock(row.getValue('cantidad_disponible'))}
      </span>
    ),
  },
];

export const Route = createFileRoute('/_app/catalogo/')({
  component: RouteComponent,
  loader: fetchAllProductosAndCatalogs,
});

function RouteComponent() {
  const { productos, categorias, equipos, proveedores } = Route.useLoaderData();
  const { setContent } = useHeader();

  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState<number | null>();
  const [marca, setMarca] = useState<number>(0);
  const [modelo, setModelo] = useState<number>(0);

  const filtered = useMemo(() => {
    return productos.filter((prod) => {
      if (
        search &&
        !prod.codigo_interno.toLowerCase().includes(search.toLowerCase()) &&
        !prod.descripcion.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (categoria && prod.categoria.id !== categoria) return false;
      if (marca && prod.equipo.marca.id !== marca) return false;
      if (modelo && prod.equipo.id !== modelo) return false;
      return true;
    });
  }, [productos, search, categoria, marca, modelo]);

  const marcas = useMemo(
    () =>
      equipos
        .map((eq) => eq.marca)
        .filter((marca, idx, all) => all.findIndex((t) => t.id === marca.id) === idx),
    [equipos]
  );

  const emptyComponent = !productos.length ? (
    <Empty className='my-0 py-0'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Package2 />
        </EmptyMedia>
        <EmptyTitle>¡El catálogo está vacío!</EmptyTitle>
        <EmptyDescription>Comienza a registrar tus productos para monitorearlos</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ) : (
    <Empty className='my-0 py-0'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Search />
        </EmptyMedia>
        <EmptyTitle>No se encontró ningún producto</EmptyTitle>
        <EmptyDescription>Pruebe a modificar los filtro de búsqueda</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );

  useEffect(() => {
    setContent(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Productos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    return () => setContent(null);
  }, []);

  return (
    <div className='space-y-4'>
      <h1 className='text-xl'>Productos en el catálogo</h1>

      <div className='flex flex-col gap-2 items-stretch md:flex-row md:items-center'>
        <InputGroup>
          <InputGroupInput
            placeholder='Buscar producto por código o descripción...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <Select value={String(categoria)} onValueChange={(v) => setCategoria(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder='Categoría' />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(marca)} onValueChange={(v) => setMarca(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder='Marca' />
          </SelectTrigger>
          <SelectContent>
            {marcas.map((mar) => (
              <SelectItem key={mar.id} value={String(mar.id)}>
                {mar.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(modelo)} onValueChange={(v) => setModelo(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder='Modelo' />
          </SelectTrigger>
          <SelectContent>
            {equipos
              .filter((eq) => (marca ? eq.marca.id === marca : true))
              .map((eq) => (
                <SelectItem key={eq.id} value={String(eq.id)}>
                  {eq.nombre}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} emptyComponent={emptyComponent} />

      <div className='fixed bottom-4 right-3 md:bottom-8 md:right-8'>
        <AddProductDialog
          trigger={
            <Button className='rounded-full' size='icon-lg' variant='default'>
              <Plus />
            </Button>
          }
          categorias={categorias}
          equipos={equipos}
          marcas={marcas}
          proveedores={proveedores}
        />
      </div>
    </div>
  );
}

function statusFromStock(stock: number) {
  if (stock === 0) return <Badge variant='destructive'>Agotado</Badge>;
  if (stock < 10) return '🟠';
  return <Badge variant='default'>Disponible</Badge>;
}
