import { fetchAllProductos } from '@/api/catalogo';
import { Badge } from '@/components/ui/badge';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { AddProductDialog } from '@/components/add-product-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartArea, ChevronDown, Package2, Plus, Search } from 'lucide-react';

export const Route = createFileRoute('/_app/catalogo/')({
  component: RouteComponent,
  loader: fetchAllProductos,
});

function RouteComponent() {
  const productos = Route.useLoaderData() ?? [];

  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [marca, setMarca] = useState<string | null>(null);
  const [modelo, setModelo] = useState<string | null>(null);

  const rows = productos.map((p) => ({
    id: p.id,
    codigo: p.codigo_interno ?? p.id,
    descripcion: p.descripcion ?? '—',
    marca: p.marca ?? p.marca_name ?? p.marca ?? '—',
    existencia: typeof p.existencia === 'number' ? p.existencia : (p.stock ?? 0),
  }));

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (
        search &&
        !String(r.codigo).toLowerCase().includes(search.toLowerCase()) &&
        !String(r.descripcion).toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (categoria && categoria !== 'Todas' && r.categoria !== categoria) return false;
      if (marca && marca !== 'Todas' && r.marca !== marca) return false;
      if (modelo && modelo !== 'Todas' && r.modelo !== modelo) return false;
      return true;
    });
  }, [rows, search, categoria, marca, modelo]);

  var emptyComponent = null;
  if (!productos.length)
    emptyComponent = (
      <Empty className='my-0 py-0'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Package2 />
          </EmptyMedia>
          <EmptyTitle>¡El catálogo está vacío!</EmptyTitle>
          <EmptyDescription>Comienza a registrar tus productos para monitorearlos</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  else if (!filtered.length)
    emptyComponent = (
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

  return (
    <div className='space-y-4'>
      <h1 className='font-bold text-3xl'>Productos en el catálogo</h1>

      <div className='flex gap-2 items-center'>
        <div className='flex-1'>
          <InputGroup>
            <InputGroupInput
              placeholder='Buscar producto...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              Categoría <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setCategoria('Todas')}>Todas</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategoria('Consumible')}>
                Consumible
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCategoria('Repuesto')}>Repuesto</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              Marca <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setMarca('Todas')}>Todas</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setMarca('KONICA')}>KONICA</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setMarca('KATUN')}>KATUN</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setMarca('FUJI')}>FUJI</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              Modelo <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setModelo('Todas')}>Todas</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setModelo('3300')}>3300</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setModelo('1120')}>1120</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setModelo('X400')}>X400</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Existencia</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => {
            const st = statusFromStock(r.existencia ?? 0);
            return (
              <TableRow key={r.id}>
                <TableCell>
                  <Link to='/catalogo/$id' params={{ id: String(r.id) }}>
                    {r.codigo}
                  </Link>
                </TableCell>
                <TableCell>{r.descripcion}</TableCell>
                <TableCell>{r.marca}</TableCell>
                <TableCell>{r.existencia}</TableCell>
                <TableCell>
                  <span className='inline-flex items-center gap-2'>{st.dot}</span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {emptyComponent}

      <div className='flex items-center justify-between py-2'>
        {/* Dialog for adding a product */}
        <AddProductDialog
          trigger={
            <Button variant='default'>
              <Plus /> Agregar producto
            </Button>
          }
        />

        <Button variant='outline'>
          <ChartArea /> Reporte
        </Button>
      </div>
    </div>
  );
}

function statusFromStock(stock: number) {
  if (stock === 0) return { dot: <Badge variant='destructive'>Agotado</Badge> };
  if (stock < 10) return { dot: '🟠' };
  return { dot: '🟢' };
}
