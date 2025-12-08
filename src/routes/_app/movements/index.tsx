import { createFileRoute, Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { EllipsisVertical, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AddMovementForm } from '@/components/add-movement-dialog';
import { DataTable } from '@/components/data-table';
import { useHeader } from '@/components/site-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';

import { fetchMovimientos } from '@/api/movimientos';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MovimientoResponse } from '@/lib/types';
import { humanDate, humanTime } from '@/lib/utils';

export const Route = createFileRoute('/_app/movements/')({
  component: RouteComponent,
  loader: async () => await fetchMovimientos(),
});

const columns: ColumnDef<MovimientoResponse>[] = [
  {
    id: 'check',
    header: () => <Checkbox />,
    cell: () => <Checkbox />,
  },
  {
    accessorKey: 'id',
    header: 'Folio',
    cell: ({ row }) => (
      <Link
        to='/movements/$id'
        params={{ id: String(row.original.id) }}
        className='font-semibold'
      >
        {row.getValue('id')}
      </Link>
    ),
  },
  {
    accessorKey: 'creado',
    header: 'Fecha',
    cell: ({ row }) => humanDate(row.getValue('creado')),
  },
  {
    id: 'hora',
    accessorKey: 'creado',
    header: 'Hora',
    cell: ({ row }) => humanTime(row.getValue('creado')),
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => (row.getValue('tipo') === 'entrada' ? 'Entrada' : 'Salida'),
  },
  {
    accessorKey: 'usuario',
    header: 'Usuario',
    cell: ({ row }) => row.getValue('usuario') ?? '',
  },
  {
    accessorKey: 'comentarios',
    header: 'Comentarios',
    cell: ({ row }) => row.getValue('comentarios') ?? '',
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted text-muted-foreground size-8'
            size='icon'
          >
            <EllipsisVertical />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-32'>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>
          <DropdownMenuItem>Marcar favorito</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant='destructive'>
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function RouteComponent() {
  const movimientos = Route.useLoaderData();
  const { setContent } = useHeader();

  const [search, setSearch] = useState('');
  const [filterEntrada, setFilterEntrada] = useState(true);
  const [filterSalida, setFilterSalida] = useState(true);

  const filtered = useMemo(() => {
    return movimientos.filter((m) => {
      if (!filterEntrada && m.tipo === 'entrada') return false;
      if (!filterSalida && m.tipo === 'salida') return false;
      if (!search) return true;
    });
  }, [movimientos, search, filterEntrada, filterSalida]);

  useEffect(() => {
    setContent(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Movimientos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    return () => setContent(null);
  }, []);

  return (
    <div className='space-y-4'>
      <div className='flex gap-4 items-center'>
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

        <div className='flex items-center gap-2'>
          <Checkbox checked={filterEntrada} onClick={() => setFilterEntrada((prev) => !prev)} />
          <Label onClick={() => setFilterEntrada((prev) => !prev)}>Entradas</Label>
        </div>
        <div className='flex items-center gap-2'>
          <Checkbox checked={filterSalida} onClick={() => setFilterSalida((prev) => !prev)} />
          <Label onClick={() => setFilterSalida((prev) => !prev)}>Salidas</Label>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      <div className='fixed bottom-4 right-3 md:bottom-8 md:right-8'>
        <AddMovementForm
          trigger={
            <Button className='rounded-full' size='icon-lg' variant='default'>
              <Plus />
            </Button>
          }
        />
      </div>
    </div>
  );
}
