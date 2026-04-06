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
  loader: async ({ params }) => await fetchMovimientoById(params.id),
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
      </Breadcrumb>,
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
                    {movimiento.creado_por.full_name}
                  </div>
                ) : (
                  '—'
                )}
              </div>
            </div>

            {/* Aprobación */}
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>¿Aprobado?</p>
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
            <div className='grid grid-cols-2'>
              <span>
                <p className='text-sm text-muted-foreground'>Número de factura</p>{' '}
                {detalleEntrada.numero_factura || '—'}
              </span>
              <span>
                <p className='text-sm text-muted-foreground'>Recibido por</p>{' '}
                {detalleEntrada.recibido_por.full_name}
              </span>
            </div>
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
            <div className='grid grid-cols-2 gap-4'>
              <span>
                <p className='text-sm text-muted-foreground'>Cliente</p>{' '}
                <Link to='/clients/$id' params={{ id: String(detalleSalida.cliente.id) }}>
                  {detalleSalida.cliente.nombre}
                </Link>
              </span>
              <span>
                <p className='text-sm text-muted-foreground'>Técnico</p> {detalleSalida.tecnico || '—'}
              </span>
              <span>
                <p className='text-sm text-muted-foreground'>¿Requiere aprobación?</p>{' '}
                {detalleSalida.requiere_aprobacion ? 'Sí' : 'No'}
              </span>
            </div>
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
