import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, CheckCircle, PackageOpen, XCircle } from 'lucide-react';
import { useEffect } from 'react';

import { DataTable } from '@/components/data-table';
import { useHeader } from '@/components/site-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';

import { fetchMovEntradaById } from '@/api/movimientos';
import type {
  LoteResponse,
  MovimientoItemResponse,
  MovimientoUnified,
  UnidadResponse,
} from '@/lib/types';
import { humanDate, humanTime } from '@/lib/utils';

const itemsColumns: ColumnDef<MovimientoItemResponse>[] = [
  {
    header: 'Producto',
    accessorKey: 'producto',
    cell: ({ row }) => (
      <Link
        to='/catalogo/$id'
        params={{ id: row.original.producto.id }}
        className='underline font-medium'
      >
        {row.original.producto.codigo_interno} – {row.original.producto.descripcion}
      </Link>
    ),
  },
  {
    header: 'Cantidad',
    accessorKey: 'cantidad',
    cell: ({ row }) => (
      <span
        className={
          row.original.tipo === 'entrada'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-red-600 dark:text-red-400 font-semibold'
        }
      >
        {row.original.cantidad}
      </span>
    ),
  },
  {
    id: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge variant={row.original.tipo === 'entrada' ? 'default' : 'destructive'}>
        {row.original.tipo === 'entrada' ? 'Entrada' : 'Salida'}
      </Badge>
    ),
  },
];

const lotesColumns: ColumnDef<LoteResponse>[] = [
  { header: 'Código', accessorKey: 'codigo_lote' },
  {
    header: 'Cantidad inicial',
    accessorKey: 'cantidad_inicial',
    cell: ({ row }) => `${row.getValue('cantidad_inicial')} unidades`,
  },
  {
    header: 'Cantidad restante',
    accessorKey: 'cantidad_restante',
    cell: ({ row }) => `${row.getValue('cantidad_restante')} unidades`,
  },
  {
    header: 'Fecha',
    accessorKey: 'fecha_entrada',
    cell: ({ row }) => humanDate(row.getValue('fecha_entrada')),
  },
  {
    id: 'hora',
    accessorKey: 'fecha_entrada',
    cell: ({ row }) => humanTime(row.getValue('fecha_entrada')),
  },
];

const unidadesColumns: ColumnDef<UnidadResponse>[] = [
  {
    header: 'Unidad',
    accessorKey: 'codigo_unidad',
  },
  {
    header: 'Lote',
    accessorKey: 'lote.codigo_lote',
    cell: ({ row }) => row.original.lote.codigo_lote,
  },
  {
    header: 'Estado',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'retirada' ? 'destructive' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    header: 'Última actualización',
    accessorKey: 'actualizado',
    cell: ({ row }) => `${humanDate(row.original.actualizado)} ${humanTime(row.original.actualizado)}`,
  },
];

export const Route = createFileRoute('/_app/movements/$id')({
  loader: async ({ params }) => await fetchMovEntradaById(Number(params.id)),
  component: RouteComponent,
});

function RouteComponent() {
  const movimiento = Route.useLoaderData() as MovimientoUnified;
  const { setContent } = useHeader();
  const router = useRouter();

  useEffect(() => {
    setContent(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to='/movimientos'>Movimientos</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {movimiento.tipo === 'entrada' ? 'Entrada #' : 'Salida #'} {movimiento.id}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    return () => setContent(null);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className='grid md:flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => router.history.back()}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <h1 className='text-2xl'>
            {movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'} #{movimiento.id}
          </h1>
        </div>
      </header>

      {/* CARD: INFORMACIÓN GENERAL */}
      <Card className='my-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Información General</CardTitle>
          <Separator />
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Tipo de movimiento</p>
                <Badge
                  variant={movimiento.tipo === 'entrada' ? 'default' : 'destructive'}
                  className='font-semibold'
                >
                  {movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                </Badge>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Fecha</p>
                <p className='font-semibold'>
                  {humanDate(movimiento.creado)} {humanTime(movimiento.creado)}
                </p>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Responsable</p>
                {movimiento.usuario ? (
                  <div className='flex gap-2.5 items-center'>
                    <Avatar>
                      <AvatarFallback>{movimiento.usuario[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {movimiento.usuario}
                  </div>
                ) : (
                  '—'
                )}
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Aprobado</p>
                {movimiento.aprobado ? (
                  <span className='flex items-center gap-2 text-green-600 dark:text-green-400'>
                    <CheckCircle className='h-4 w-4' /> Sí – {humanDate(movimiento.aprobado_fecha)}
                  </span>
                ) : (
                  <span className='flex items-center gap-2 text-red-600 dark:text-red-400'>
                    <XCircle className='h-4 w-4' /> No aprobado
                  </span>
                )}
              </div>

              {movimiento.comentarios && (
                <div>
                  <p className='text-sm text-muted-foreground'>Comentarios</p>
                  <p>{movimiento.comentarios}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CAMPOS ESPECÍFICOS SEGÚN TIPO */}
      {movimiento.tipo === 'entrada' && (
        <Card className='my-6'>
          <CardHeader>
            <CardTitle className='text-lg'>Datos de la entrada</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <p>
                <strong>Número de factura:</strong> {movimiento.numero_factura || '—'}
              </p>
              <p>
                <strong>Recibido por:</strong> {movimiento.recibido_por || '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {movimiento.tipo === 'salida' && (
        <Card className='my-6'>
          <CardHeader>
            <CardTitle className='text-lg'>Datos de la salida</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <p>
                <strong>Cliente:</strong> {movimiento.nombre_cliente || '—'}
              </p>
              <p>
                <strong>Técnico:</strong> {movimiento.tecnico || '—'}
              </p>
              <p>
                <strong>Entregado por:</strong> {movimiento.entregado_por || '—'}
              </p>
              <p>
                <strong>Recibido por:</strong> {movimiento.recibido_por || '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TABLA DE ITEMS */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Productos del movimiento</CardTitle>
          <Separator />
        </CardHeader>
        <CardContent>
          <DataTable
            data={movimiento.items}
            columns={itemsColumns}
            transparent
            emptyComponent={
              <Empty className='my-0 py-0'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <PackageOpen />
                  </EmptyMedia>
                  <EmptyTitle>No hay productos</EmptyTitle>
                </EmptyHeader>
              </Empty>
            }
          />
        </CardContent>
      </Card>

      {/* TABLA DE LOTES (SOLO ENTRADA) */}
      {movimiento.tipo === 'entrada' && movimiento.lotes && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-lg'>Lotes generados</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <DataTable
              data={movimiento.lotes}
              columns={lotesColumns}
              transparent
              emptyComponent={
                <Empty className='my-0 py-0'>
                  <EmptyHeader>
                    <EmptyMedia variant='icon'>
                      <PackageOpen />
                    </EmptyMedia>
                    <EmptyTitle>No hay lotes</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* TABLA DE UNIDADES (SOLO SALIDA) */}
      {movimiento.tipo === 'salida' && movimiento.unidades && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='text-lg'>Unidades asignadas</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <DataTable
              data={movimiento.unidades}
              columns={unidadesColumns}
              transparent
              emptyComponent={
                <Empty className='my-0 py-0'>
                  <EmptyHeader>
                    <EmptyMedia variant='icon'>
                      <PackageOpen />
                    </EmptyMedia>
                    <EmptyTitle>No hay unidades</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              }
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
