import { createFileRoute, ErrorComponent, Link, useRouter } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, CheckCircle, PackageOpen, XCircle } from 'lucide-react';
import { useEffect } from 'react';

import { DataTable } from '@/components/data-table';
import { useHeader } from '@/components/site-header';
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

import { fetchMovimientoById } from '@/api/movimientos';
import type { MovimientoItemResponse } from '@/lib/types';
import { humanDate, humanTime, plural } from '@/lib/utils';

const itemsColumns: ColumnDef<MovimientoItemResponse>[] = [
  {
    accessorKey: 'producto.id',
    header: 'Producto',
    cell: ({ row }) => (
      <Link
        to='/catalogo/$id'
        params={{ id: String(row.original.producto.id) }}
        className='font-medium'
      >
        {row.original.producto.codigo_interno}
      </Link>
    ),
  },
  {
    accessorKey: 'producto.descripcion',
    header: 'Descripción',
  },
  {
    accessorKey: 'cantidad',
    header: 'Cantidad',
    cell: ({ row }) => plural('unidad', row.getValue('cantidad')),
  },
];

export const Route = createFileRoute('/_app/movements/$id')({
  loader: async ({ params }) => await fetchMovimientoById(Number(params.id)),
  component: MovementDetailPage,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

function MovementDetailPage() {
  const movimiento = Route.useLoaderData();
  const { setContent } = useHeader();
  const router = useRouter();

  const detalleEntrada = movimiento.detalle_entrada;
  const detalleSalida = movimiento.detalle_salida;

  useEffect(() => {
    setContent(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to='/movements'>Movimientos</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {movimiento.tipo === 'entrada' ? 'Entrada #' : 'Salida #'}
              {movimiento.id}
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

      {/* INFORMACIÓN GENERAL */}
      <Card className='my-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Información General</CardTitle>
          <Separator />
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-2 gap-8'>
            <div className='space-y-4'>
              {/* Tipo */}
              <div>
                <p className='text-sm text-muted-foreground'>Tipo de movimiento</p>
                <Badge
                  variant={movimiento.tipo === 'entrada' ? 'default' : 'destructive'}
                  className='font-semibold'
                >
                  {movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                </Badge>
              </div>

              {/* Fecha */}
              <div>
                <p className='text-sm text-muted-foreground'>Fecha</p>
                <p>
                  {humanDate(movimiento.creado)} {humanTime(movimiento.creado)}
                </p>
              </div>

              {/* Creador */}
              <div>
                <p className='text-sm text-muted-foreground'>Creado por</p>
                {movimiento.creado_por ? (
                  <div className='flex gap-2.5 items-center'>
                    {/* <Avatar>
                      <AvatarFallback>{movimiento.creado_por[0].toUpperCase()}</AvatarFallback>
                    </Avatar> */}
                    {movimiento.creado_por.first_name} {movimiento.creado_por.last_name}
                  </div>
                ) : (
                  '—'
                )}
              </div>
            </div>

            {/* Aprobación */}
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Aprobado</p>
                {movimiento.aprobado ? (
                  <span className='flex items-center gap-2 text-green-600 dark:text-green-400'>
                    <CheckCircle className='h-4 w-4' /> Sí
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

      {/* DETALLE ENTRADA */}
      {movimiento.tipo === 'entrada' && detalleEntrada && (
        <Card className='my-6'>
          <CardHeader>
            <CardTitle className='text-lg'>Datos de la entrada</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <p>
              <strong>Número de factura:</strong> {detalleEntrada.numero_factura || '—'}
            </p>
            <p>
              <strong>Recibido por:</strong> {detalleEntrada.recibido_por.first_name}{' '}
              {detalleEntrada.recibido_por.last_name}
            </p>
          </CardContent>
        </Card>
      )}

      {/* DETALLE SALIDA */}
      {movimiento.tipo === 'salida' && detalleSalida && (
        <Card className='my-6'>
          <CardHeader>
            <CardTitle className='text-lg'>Datos de la salida</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <p>
              <strong>Cliente:</strong> {detalleSalida.cliente.nombre || '—'}
            </p>
            <p>
              <strong>Técnico:</strong> {detalleSalida.tecnico || '—'}
            </p>
            <p>
              <strong>Requiere aprobación:</strong> {detalleSalida.requiere_aprobacion ? 'Sí' : 'No'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ITEMS */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Productos del movimiento</CardTitle>
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
    </>
  );
}
/*
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
    cell: ({ row }) => row.original.lote,
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
    header: 'Actualizado',
    accessorKey: 'actualizado',
    cell: ({ row }) => `${humanDate(row.original.actualizado)} ${humanTime(row.original.actualizado)}`,
  },
];

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
*/
