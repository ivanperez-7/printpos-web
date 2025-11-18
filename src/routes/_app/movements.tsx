import { createFileRoute, useRouter } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { fetchMovimientos } from '@/api/movimientos';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
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
import { withAuth } from '@/lib/auth';
import type {
  MovimientoEntradaCreate,
  MovimientoSalidaCreate,
  MovimientoUnified,
  ProductoResponse,
  TodosMovimientosResponse,
} from '@/lib/types';
import { humanDate, humanTime } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, RefreshCcw, Search } from 'lucide-react';

export const Route = createFileRoute('/_app/movements')({
  component: RouteComponent,
  loader: async () => await fetchMovimientos(),
});

export function combineTodos(m: TodosMovimientosResponse): MovimientoUnified[] {
  const entradas = (m.entradas || []).map((e) => ({
    id: `e-${e.id}`,
    fecha: e.creado,
    producto: e.producto,
    tipo: 'entrada' as const,
    cantidad: e.cantidad,
    usuario: e.recibido_por?.username ?? null,
    comentarios: e.comentarios ?? null,
    original: e,
  }));

  const salidas = (m.salidas || []).map((s) => ({
    id: `s-${s.id}`,
    fecha: s.creado,
    producto: s.producto,
    tipo: 'salida' as const,
    cantidad: -s.cantidad, // negative to show as -2 in table
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
    accessorKey: 'fecha',
    header: 'Hora',
    cell: ({ row }) => humanTime(row.getValue('fecha')),
  },
  {
    accessorKey: 'producto',
    header: 'Producto',
    cell: ({ row }) => (row.getValue('producto') as ProductoResponse).codigo_interno,
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
  const router = useRouter();

  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEntrada, setFilterEntrada] = useState(true);
  const [filterSalida, setFilterSalida] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return combineTodos(movimientos).filter((m) => {
      if (!filterEntrada && m.tipo === 'entrada') return false;
      if (!filterSalida && m.tipo === 'salida') return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (m.producto.descripcion || '').toLowerCase().includes(q) ||
        (m.producto.codigo_interno || '').toLowerCase().includes(q) ||
        (m.comentarios || '').toLowerCase().includes(q)
      );
    });
  }, [movimientos, search, filterEntrada, filterSalida]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleRefresh() {
    router.invalidate();
    toast.success('Tabla actualizada');
  }

  async function handleCreateMovement(
    payload: Partial<MovimientoEntradaCreate & MovimientoSalidaCreate> & {
      tipo?: 'entrada' | 'salida';
    }
  ) {
    const tipo = payload.tipo || 'entrada';

    router.invalidate();
    setOpenModal(false);
    toast.success('Movimiento registrado (optimista)');

    // try to persist using dedicated endpoints if available
    try {
      if (tipo === 'entrada') {
        await withAuth.post('/movimientos/entradas/', {
          producto: (payload.producto as any)?.id ?? (payload.producto as any) ?? null,
          cantidad: Math.abs(payload.cantidad || 0),
          proveedor: (payload as any).proveedor ?? null,
          numero_factura: (payload as any).numero_factura ?? null,
          recibido_por: (payload as any).recibido_por ?? null,
          comentarios: (payload as any).comentarios ?? null,
          tipo_entrada: (payload as any).tipo_entrada ?? 'compra',
        } as MovimientoEntradaCreate);
      } else {
        await withAuth.post('/movimientos/salidas/', {
          producto: (payload.producto as any)?.id ?? (payload.producto as any) ?? null,
          cantidad: Math.abs(payload.cantidad || 0),
          tipo_salida: (payload as any).tipo_salida ?? 'project',
          entregado_por: (payload as any).entregado_por ?? null,
          recibido_por: (payload as any).recibido_por ?? null,
          requiere_aprobacion: (payload as any).requiere_aprobacion ?? false,
          comentarios: (payload as any).comentarios ?? null,
        } as MovimientoSalidaCreate);
      }

      toast.success('Movimiento guardado en servidor');
      // refresh to get canonical data from server
      await handleRefresh();
    } catch (err) {
      // keep optimistic but notify
      toast.error('No se pudo guardar en servidor; movimiento sólo local');
    }
  }

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  return (
    <div className='space-y-4'>
      <header className='flex items-center justify-between'>
        <h1 className='font-bold text-2xl'>Movimientos de inventario</h1>

        <div className='flex items-center gap-2'>
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button variant='default'>
                <Plus /> Registrar movimiento
              </Button>
            </DialogTrigger>

            <DialogContent className='max-w-lg'>
              <DialogHeader>
                <DialogTitle>Registrar movimiento</DialogTitle>
              </DialogHeader>

              <AddMovementForm
                productos={productos}
                onSubmit={handleCreateMovement}
                onCancel={() => setOpenModal(false)}
              />

              <DialogFooter>
                <Button variant='ghost' onClick={() => setOpenModal(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant='outline' onClick={handleRefresh}>
            <RefreshCcw /> Actualizar tabla
          </Button>
        </div>
      </header>

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

      <div>
        <DataTable columns={columns} data={pageData} />

        <div className='flex items-center justify-between py-2'>
          <div>
            Mostrar {pageData.length} de {filtered.length} movimientos
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='ghost' onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft />
            </Button>
            <div>
              Página {page} / {totalPages}
            </div>
            <Button variant='ghost' onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddMovementForm({
  productos,
  onSubmit,
  onCancel,
}: {
  productos: ProductoResponse[];
  onSubmit: (
    p: Partial<MovimientoEntradaCreate & MovimientoSalidaCreate> & { tipo?: 'entrada' | 'salida' }
  ) => void;
  onCancel: () => void;
}) {
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [productoId, setProductoId] = useState<number | null>(productos[0]?.id ?? null);
  const [cantidad, setCantidad] = useState<number>(0);
  const [comentarios, setComentarios] = useState('');

  useEffect(() => {
    if (productos.length && productoId == null) setProductoId(productos[0].id);
  }, [productos]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const productoObj = productos.find((p) => p.id === productoId) || productos[0];
    const productoPayload = productoObj ? productoObj.id : productoId;
    onSubmit({ producto: productoPayload as any, tipo, cantidad: Math.abs(cantidad), comentarios });
  }

  return (
    <form onSubmit={submit} className='grid gap-3 py-2'>
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

      <div className='flex justify-end gap-2'>
        <Button variant='ghost' onClick={onCancel} type='button'>
          Cancelar
        </Button>
        <Button type='submit' variant='default'>
          Registrar
        </Button>
      </div>
    </form>
  );
}
