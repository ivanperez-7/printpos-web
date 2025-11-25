import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { createFileRoute, Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, ArrowLeftRight, Edit } from 'lucide-react';
import { useEffect } from 'react';

// COMPONENTES DEL PROYECTO
import { AddProductDialog } from '@/components/add-product-dialog';
import { CustomLink } from '@/components/custom-link';
import { useHeader } from '@/components/site-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// OTRAS UTILIDADES
import { fetchProductoById } from '@/api/catalogo';
import { DataTable } from '@/components/data-table';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import type { MovimientoUnified } from '@/lib/types';
import { humanDate, humanTime } from '@/lib/utils';
import { combineMovements } from '../movements';

const columns: ColumnDef<MovimientoUnified>[] = [
  {
    accessorKey: 'fecha',
    header: 'Fecha',
    cell: ({ row }) => <span>{humanDate(row.getValue('fecha'))}</span>,
  },
  {
    id: 'hora',
    accessorKey: 'fecha',
    header: 'Hora',
    cell: ({ row }) => <span>{humanTime(row.getValue('fecha'))}</span>,
  },
  {
    id: 'tipo',
    accessorKey: 'cantidad',
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge variant={(row.getValue('cantidad') as number) > 0 ? 'default' : 'destructive'}>
        {(row.getValue('cantidad') as number) > 0 ? 'Entrada' : 'Salida'}
      </Badge>
    ),
  },
  {
    accessorKey: 'cantidad',
    header: 'Cantidad',
    cell: ({ row }) => (
      <span
        className={
          (row.getValue('cantidad') as number) > 0
            ? 'text-green-600 font-semibold'
            : 'text-red-600 font-semibold'
        }
      >
        {row.getValue('cantidad') as number} {row.original.producto.unidad}s
      </span>
    ),
  },
  {
    accessorKey: 'usuario',
    header: 'Responsable',
    cell: ({ row }) =>
      row.getValue('usuario') && (
        <div className='flex gap-2.5 items-center'>
          <Avatar>
            <AvatarFallback>
              {(row.getValue('usuario') as string)[0].toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
          {row.getValue('usuario')}
        </div>
      ),
  },
];

export const Route = createFileRoute('/_app/catalogo/$id')({
  component: RouteComponent,
  loader: async ({ params }) => await fetchProductoById(Number(params.id)),
});

function RouteComponent() {
  const { producto, movimientos } = Route.useLoaderData();
  const { setContent } = useHeader();

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
      {/* Header with back button and product title */}
      <div className='flex items-center gap-4'>
        <CustomLink variant='ghost' size='icon' to='/catalogo'>
          <ArrowLeft className='h-4 w-4' />
        </CustomLink>
        <h1 className='text-2xl font-bold'>{producto.descripcion}</h1>

        <AddProductDialog
          trigger={
            <Button>
              <Edit className='h-4 w-4' />
              Editar
            </Button>
          }
          categorias={[]}
          marcas={[]}
          equipos={[]}
          proveedores={[]}
          producto={producto}
        />
      </div>

      {/* Product Information Card */}
      <Card className='my-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Información General</CardTitle>
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
                <p className='font-semibold'>{producto.categoria?.nombre}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Serie/Lote</p>
                <p className='font-semibold'>{producto.serie_lote || 'N/A'}</p>
              </div>
            </div>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Marca</p>
                <p className='font-semibold'>{producto.equipo.marca.nombre || 'N/A'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Modelo</p>
                <p className='font-semibold'>{producto.equipo.nombre || 'N/A'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Existencia</p>
                <p className='font-semibold'>
                  {producto.cantidad_disponible} {producto.unidad}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Movement History Table */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Últimos movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={combineMovements(movimientos)}
            columns={columns}
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
