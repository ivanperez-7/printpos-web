import { ENDPOINTS } from '@/api/endpoints';
import { fetchMovimientos } from '@/api/movimientos';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
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
import { withAuth } from '@/lib/auth';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_app/movements')({
  component: RouteComponent,
  loader: async () => await fetchMovimientos(),
});

function humanDate(iso?: string) {
  if (!iso) return '';
  try {
    return format(new Date(iso), 'dd/MM/yy');
  } catch {
    return iso;
  }
}

function RouteComponent() {
  const { productos, movimientos } = Route.useLoaderData();

  const [search, setSearch] = useState('');
  const [filterEntrada, setFilterEntrada] = useState(true);
  const [filterSalida, setFilterSalida] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [openModal, setOpenModal] = useState(false);

  const filtered = useMemo(() => {
    return movimientos
      .filter((m) => {
        if (!filterEntrada && m.tipo === 'entrada') return false;
        if (!filterSalida && m.tipo === 'salida') return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          (m.producto.descripcion || '').toLowerCase().includes(q) ||
          (m.producto.codigo_interno || '').toLowerCase().includes(q) ||
          (m.comentarios || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
  }, [movimientos, search, filterEntrada, filterSalida]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = useMemo(
    () => [
      { header: 'Fecha', accessorKey: 'fecha', cell: (row: any) => humanDate(row.fecha) },
      {
        header: 'Producto',
        accessorKey: 'producto',
        cell: (row: any) => `${row.producto.codigo_interno ?? ''} ${row.producto.descripcion ?? ''}`,
      },
      {
        header: 'Tipo',
        accessorKey: 'tipo',
        cell: (row: any) => (row.tipo === 'entrada' ? 'Entrada' : 'Salida'),
      },
      {
        header: 'Cantidad',
        accessorKey: 'cantidad',
        cell: (row: any) => (row.cantidad > 0 ? `+${row.cantidad}` : `${row.cantidad}`),
      },
      { header: 'Usuario', accessorKey: 'usuario', cell: (row: any) => row.usuario ?? '' },
      { header: 'Comentarios', accessorKey: 'comentarios', cell: (row: any) => row.comentarios ?? '' },
    ],
    []
  );

  async function handleRefresh() {
    try {
      const res = await withAuth.get('/movements/');
      setMovimientos(res.data || []);
      toast.success('Tabla actualizada');
    } catch (err) {
      toast.error('No se pudo actualizar, mostrando datos locales');
    }
  }

  async function handleCreateMovement(payload: Partial<Movimiento>) {
    // optimistic UI: add to list
    const nuevo: Movimiento = {
      id: `m_${Date.now()}`,
      fecha: new Date().toISOString(),
      producto: payload.producto as Producto,
      tipo: (payload.tipo as Movimiento['tipo']) || 'entrada',
      cantidad: payload.cantidad || 0,
      usuario: payload.usuario || 'yo',
      comentarios: payload.comentarios || null,
    };
    setMovimientos((s) => [nuevo, ...s]);
    setOpenModal(false);
    toast.success('Movimiento registrado (optimista)');

    // try to persist
    try {
      await withAuth.post('/movements/', nuevo);
      toast.success('Movimiento guardado en servidor');
    } catch (err) {
      // fine: keep optimistic but notify
      toast.error('No se pudo guardar en servidor; movimiento sólo local');
    }
  }

  return (
    <div className='space-y-4'>
      <header className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold flex items-center gap-2'>
          <span aria-hidden>📦</span> Movimientos de Inventario
        </h1>

        <div className='flex items-center gap-2'>
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button variant='default'>+ Registrar movimiento</Button>
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
            🔄 Actualizar tabla
          </Button>
        </div>
      </header>

      <div className='flex gap-4 items-center'>
        <div className='flex-1'>
          <Input
            placeholder='🔍 Buscar producto...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className='flex items-center gap-3'>
          <label className='inline-flex items-center gap-2'>
            <input
              type='checkbox'
              checked={filterEntrada}
              onChange={(e) => setFilterEntrada(e.target.checked)}
            />{' '}
            Entrada
          </label>
          <label className='inline-flex items-center gap-2'>
            <input
              type='checkbox'
              checked={filterSalida}
              onChange={(e) => setFilterSalida(e.target.checked)}
            />{' '}
            Salida
          </label>
        </div>
      </div>

      <div>
        <DataTable columns={columns as any} data={pageData as any} />

        <div className='flex items-center justify-between py-2'>
          <div>
            Mostrar {pageData.length} de {filtered.length} movimientos
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={() => setPage((p) => Math.max(1, p - 1))}>
              ◀
            </Button>
            <div>
              Página {page} / {totalPages}
            </div>
            <Button variant='outline' onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              ▶
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
  productos: Producto[];
  onSubmit: (p: Partial<Movimiento>) => void;
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
    const producto = productos.find((p) => p.id === productoId) || (productos[0] as Producto);
    const qty = tipo === 'entrada' ? Math.abs(cantidad) : -Math.abs(cantidad);
    onSubmit({ producto, tipo, cantidad: qty, comentarios });
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
