import { createFileRoute } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';
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
import type { MovimientoUnified, TodosMovimientosResponse } from '@/lib/types';
import { humanDate, humanTime } from '@/lib/utils';

export const Route = createFileRoute('/_app/movements/')({
  component: RouteComponent,
  loader: async () => await fetchMovimientos(),
});

export function combineMovements(m: TodosMovimientosResponse): MovimientoUnified[] {
  const entradas = (m.entradas || []).map((e) => ({
    id: `e-${e.id}`,
    fecha: e.creado,
    tipo: 'entrada' as const,
    usuario: e.recibido_por?.username ?? null,
    comentarios: e.comentarios ?? null,
    items: e.items,
    original: e,
  }));

  const salidas = (m.salidas || []).map((s) => ({
    id: `s-${s.id}`,
    fecha: s.creado,
    tipo: 'salida' as const,
    usuario: s.entregado_por?.username ?? null,
    comentarios: s.comentarios ?? null,
    items: s.items,
    original: s,
  }));

  return [...entradas, ...salidas].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
}

const columns: ColumnDef<MovimientoUnified>[] = [
  {
    accessorKey: 'fecha',
    header: 'Fecha',
    cell: ({ row }) => humanDate(row.getValue('fecha')),
  },
  {
    id: 'hora',
    accessorKey: 'fecha',
    header: 'Hora',
    cell: ({ row }) => humanTime(row.getValue('fecha')),
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => (row.getValue('tipo') === 'entrada' ? 'Entrada' : 'Salida'),
  },
  {
    accessorKey: 'cantidad',
    header: 'Cantidad',
    cell: ({ row }) =>
      (row.getValue('cantidad') as number) > 0
        ? `+${row.getValue('cantidad')}`
        : `${row.getValue('cantidad')}`,
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
];

function RouteComponent() {
  const movimientos = Route.useLoaderData();
  const { setContent } = useHeader();

  const [search, setSearch] = useState('');
  const [filterEntrada, setFilterEntrada] = useState(true);
  const [filterSalida, setFilterSalida] = useState(true);

  const filtered = useMemo(() => {
    return combineMovements(movimientos).filter((m) => {
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
