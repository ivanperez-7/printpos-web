import { fetchProductoById } from '@/api/catalogo';
import { CustomLink } from '@/components/custom-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, Package, BarChart3, Edit, Scroll } from 'lucide-react';
import { combineTodos } from '../movements';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { humanDate, humanTime } from '@/lib/utils';

export const Route = createFileRoute('/_app/catalogo/$id')({
  component: RouteComponent,
  loader: async ({ params }) => await fetchProductoById(Number(params.id)),
});

function RouteComponent() {
  const { producto, movimientos } = Route.useLoaderData();

  return (
    <div>
      {/* Header with back button and product title */}
      <div className='flex items-center gap-4'>
        <CustomLink variant='ghost' size='icon' to='/catalogo'>
          <ArrowLeft className='h-4 w-4' />
        </CustomLink>
        <div>
          <h1 className='text-2xl font-bold'>{producto.descripcion}</h1>
        </div>
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
                <p className='font-semibold'>{producto.marca?.nombre || 'N/A'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Modelo</p>
                <p className='font-semibold'>{producto.nombre_modelo || 'N/A'}</p>
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

      {/* Action Buttons */}
      <div className='flex gap-3 mb-6'>
        <Button variant='outline' className='gap-2'>
          <Package className='h-4 w-4' />
          Ver movimientos
        </Button>
        <Button variant='outline' className='gap-2'>
          <BarChart3 className='h-4 w-4' />
          Estadísticas
        </Button>
        <Button className='gap-2'>
          <Edit className='h-4 w-4' />
          Editar
        </Button>
      </div>

      <Separator />

      {/* QR Code Section */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-lg'>Código QR del producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300'>
            <div className='text-gray-500 flex gap-2'>
              <Scroll /> QR IMAGE PLACEHOLDER
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
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Responsable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combineTodos(movimientos).map((movimiento, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{humanDate(movimiento.fecha)}</TableCell>
                    <TableCell>{humanTime(movimiento.fecha)}</TableCell>
                    <TableCell>
                      <Badge variant={movimiento.cantidad > 0 ? 'default' : 'destructive'}>
                        {movimiento.cantidad > 0 ? 'Entrada' : 'Salida'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        movimiento.cantidad > 0
                          ? 'text-green-600 font-semibold'
                          : 'text-red-600 font-semibold'
                      }
                    >
                      {movimiento.cantidad} {producto.unidad}s
                    </TableCell>
                    <TableCell>
                      {movimiento.usuario && (
                        <div className='flex gap-2.5 items-center'>
                          <Avatar>
                            <AvatarFallback>
                              {movimiento.usuario[0].toLocaleUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {movimiento.usuario}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
