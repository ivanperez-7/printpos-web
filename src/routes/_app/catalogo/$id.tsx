import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowDownToDot,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpFromDot,
  CheckCircle,
  Edit,
  PackageOpen,
  Trash,
} from 'lucide-react';
import { useEffect } from 'react';

// COMPONENTES DEL PROYECTO
import { AddMovementForm } from '@/components/add-movement-dialog';
import { AddProductDialog } from '@/components/add-product-dialog';
import { DataTable } from '@/components/data-table';
import { DeleteProductDialog } from '@/components/delete-product-dialog';
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';

// OTRAS UTILIDADES
import { fetchProductoById } from '@/api/catalogo';
import type { LoteResponse, MovimientoResponse } from '@/lib/types';
import { humanDate, humanTime, plural } from '@/lib/utils';

const columns: ColumnDef<MovimientoResponse & { cantidad: number; producto_id: number }>[] = [
  {
    accessorKey: 'id',
    header: 'Folio',
    cell: ({ row }) => (
      <Link to='/movements/$id' params={{ id: String(row.original.id) }} className='font-semibold'>
        {row.getValue('id')}
      </Link>
    ),
  },
  {
    accessorKey: 'creado',
    header: 'Fecha',
    cell: ({ row }) => <span>{humanDate(row.getValue('creado'))}</span>,
  },
  {
    id: 'hora',
    accessorKey: 'creado',
    header: 'Hora',
    cell: ({ row }) => <span>{humanTime(row.getValue('creado'))}</span>,
  },
  {
    id: 'tipo',
    accessorKey: 'cantidad',
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge variant={row.original.tipo === 'entrada' ? 'default' : 'destructive'}>
        {row.original.tipo === 'entrada' ? 'Entrada' : 'Salida' /* cringe */}
      </Badge>
    ),
  },
  {
    accessorKey: 'cantidad',
    header: 'Cantidad',
    cell: ({ row }) => (
      <span
        className={
          row.original.tipo === 'entrada'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-red-600 dark:text-red-400 font-semibold'
        }
      >
        {row.getValue('cantidad') as number}
      </span>
    ),
  },
  {
    accessorKey: 'aprobado',
    header: '¿Aprobado?',
    cell: ({ row }) =>
      row.getValue('aprobado') && (
        <div className='flex gap-1.5 items-center'>
          <CheckCircle className='size-4 text-green-700 dark:text-green-400' />{' '}
          <span className='text-muted-foreground'>
            {row.original.user_aprueba?.first_name} {row.original.user_aprueba?.last_name}
          </span>
        </div>
      ),
  },
];

const lotesColumns: ColumnDef<LoteResponse>[] = [
  {
    accessorKey: 'codigo_lote',
    header: 'Código',
  },
  {
    accessorKey: 'cantidad_inicial',
    header: 'Cantidad inicial',
    cell: ({ row }) => <span>{row.getValue('cantidad_inicial')} unidades</span>,
  },
  {
    accessorKey: 'cantidad_restante',
    header: 'Cantidad restante',
    cell: ({ row }) => <span>{row.getValue('cantidad_restante')} unidades</span>,
  },
  {
    accessorKey: 'fecha_entrada',
    header: 'Fecha de entrada',
    cell: ({ row }) => humanDate(row.getValue('fecha_entrada')),
  },
  {
    id: 'hora_entrada',
    accessorKey: 'fecha_entrada',
    header: 'Hora de entrada',
    cell: ({ row }) => humanTime(row.getValue('fecha_entrada')),
  },
];

export const Route = createFileRoute('/_app/catalogo/$id')({
  component: RouteComponent,
  loader: async ({ params }) => await fetchProductoById(Number(params.id)),
});

function RouteComponent() {
  const { producto, movimientos, lotes } = Route.useLoaderData();
  const { setContent } = useHeader();
  const router = useRouter();

  useEffect(() => {
    setContent(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to='/catalogo'>Productos</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{producto.codigo_interno}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    return () => setContent(null);
  }, []);

  return (
    <>
      {/* Header con título y botones de editar y eliminar */}
      <header className='grid md:flex justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => router.history.back()}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <h1 className='text-2xl'>{producto.descripcion}</h1>
        </div>

        <div className='space-x-2'>
          <AddProductDialog
            trigger={
              <Button variant='ghost'>
                <Edit className='h-4 w-4' />
                Editar
              </Button>
            }
            producto={producto}
          />
          <DeleteProductDialog
            trigger={
              <Button variant='destructive'>
                <Trash className='h-4 w-4' />
              </Button>
            }
            productId={producto.id}
          />
        </div>
      </header>

      {/* Product Information Card */}
      <Card className='my-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Información General</CardTitle>
          <Separator />
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Código</p>
                <p className='font-semibold'>{producto.codigo_interno}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Categoría</p>
                <p>{producto.categoria?.nombre}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>SKU</p>
                <p>{producto.sku}</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Existencia</p>
                <p>{plural('unidad', producto.cantidad_disponible)}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground '>Equipos compatibles</p>
                {producto.equipos?.length > 0 ? (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {producto.equipos.map((eq) => (
                      <Badge key={eq.id} variant='secondary' className='px-3 py-1 gap-2'>
                        {eq.nombre}{' '}
                        <span className='text-xs text-muted-foreground'>{eq.marca.nombre}</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p>N/A</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {producto.proveedor && (
        <Card className='my-6'>
          <CardHeader>
            <CardTitle className='text-lg'>Proveedor de este producto</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-8'>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Razón social</p>
                  <p className='font-semibold'>{producto.proveedor.nombre}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Nombre de contacto</p>
                  <p className='font-semibold'>{producto.proveedor.nombre_contacto}</p>
                </div>
              </div>
              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Teléfono</p>
                  <p className='font-semibold'>{producto.proveedor.telefono || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Correo</p>
                  <a className='font-semibold' href={'mailto:' + producto.proveedor.correo}>
                    {producto.proveedor.correo || 'N/A'}
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de lotes */}
      <Card className='mb-6'>
        <CardHeader className='grid items-center md:flex md:justify-between'>
          <CardTitle className='text-lg'>Lotes en el almacén</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={lotes}
            columns={lotesColumns}
            transparent
            emptyComponent={
              <Empty className='my-0 py-0'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <PackageOpen />
                  </EmptyMedia>
                  <EmptyTitle>No se ha registrado ningún lote</EmptyTitle>
                  <EmptyDescription>
                    Comienza registrando un lote por medio de una entrada
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            }
          />
        </CardContent>
      </Card>

      <Card className='mb-6'>
        <CardHeader className='grid items-center md:flex md:justify-between'>
          <CardTitle className='text-lg'>Últimos movimientos</CardTitle>
          <div className='grid md:flex gap-3'>
            <AddMovementForm
              trigger={
                <Button size='sm'>
                  <ArrowDownToDot />
                  Registrar entrada
                </Button>
              }
            />
            <AddMovementForm
              trigger={
                <Button variant='secondary' size='sm'>
                  <ArrowUpFromDot />
                  Registrar salida
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            // hacemos básicamente un cross product de cada movimiento con su array de items
            data={movimientos.flatMap((mov) =>
              mov.items.map((item) => ({
                cantidad: item.cantidad,
                producto_id: item.producto.id,
                ...mov,
              }))
            )}
            columns={columns}
            transparent
            emptyComponent={
              <Empty className='my-0 py-0'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <ArrowLeftRight />
                  </EmptyMedia>
                  <EmptyTitle>No se ha hecho ningún movimiento</EmptyTitle>
                  <EmptyDescription>
                    Comienza registrando una entrada o salida de este producto
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            }
          />
        </CardContent>
      </Card>
    </>
  );
}
