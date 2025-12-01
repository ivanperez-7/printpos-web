import { createFileRoute } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';

import { fetchMovimientos } from '@/api/movimientos';
import type { MovimientoUnified, ProductoResponse, TodosMovimientosResponse } from '@/lib/types';
import { humanDate, humanTime } from '@/lib/utils';

export const Route = createFileRoute('/_app/movements')({
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
    original: e,
  }));

  const salidas = (m.salidas || []).map((s) => ({
    id: `s-${s.id}`,
    fecha: s.creado,
    tipo: 'salida' as const,
    usuario: s.entregado_por?.username ?? null,
    comentarios: s.comentarios ?? null,
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
  const { productos, movimientos } = Route.useLoaderData();
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
          productos={productos}
        />
      </div>
    </div>
  );
}

function AddMovementForm({
  trigger,
  productos,
}: {
  trigger: React.ReactNode;
  productos: ProductoResponse[];
}) {
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [productoId, setProductoId] = useState<number | null>(productos[0]?.id ?? null);
  const [cantidad, setCantidad] = useState<number>(0);
  const [comentarios, setComentarios] = useState('');

  useEffect(() => {
    if (productos.length && productoId == null) setProductoId(productos[0].id);
  }, [productos]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
        </DialogHeader>

        <form onSubmit={() => {}} className='grid gap-3 py-2'>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Tipo</FieldLabel>
                <div className='flex gap-2'>
                  <Button
                    variant={tipo === 'entrada' ? 'default' : 'outline'}
                    onClick={() => setTipo('entrada')}
                    type='button'
                  >
                    Entrada
                  </Button>
                  <Button
                    variant={tipo === 'salida' ? 'default' : 'outline'}
                    onClick={() => setTipo('salida')}
                    type='button'
                  >
                    Salida
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel>Producto</FieldLabel>
                <select
                  className='w-full rounded border px-2 py-1'
                  value={productoId ?? ''}
                  disabled={productos.length === 0}
                  onChange={(e) => setProductoId(Number(e.target.value))}
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo_interno} {p.descripcion}
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                <FieldLabel>Cantidad</FieldLabel>
                <Input
                  type='number'
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </Field>

              <Field>
                <FieldLabel>Comentarios</FieldLabel>
                <Input value={comentarios} onChange={(e) => setComentarios(e.target.value)} />
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter>
          <Button type='submit' variant='default'>
            Registrar
          </Button>
          <DialogClose asChild>
            <Button variant='ghost'>Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
