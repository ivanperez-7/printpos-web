import { createFileRoute, useRouter } from '@tanstack/react-router';
import { EllipsisVertical, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { ENDPOINTS } from '@/api/endpoints';
import { useCatalogs } from '@/hooks/use-catalogs';
import { withAuth } from '@/lib/auth';
import { type MarcaResponse } from '@/lib/types';

export const Route = createFileRoute('/_app/equipos')({
  component: RouteComponent,
});

function RouteComponent() {
  const { marcas, equipos } = useCatalogs();
  const [selectedMarca, setSelectedMarca] = useState<number | null>(null);
  const [marcaParaEditar, setMarcaParaEditar] = useState<MarcaResponse | null>(null);
  const [openMarcaPopover, setOpenMarcaPopover] = useState(false);

  const equiposFiltrados = selectedMarca ? equipos.filter((e) => e.marca.id === selectedMarca) : [];

  const reloadAll = () => {};

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl'>Administrar marcas y equipos</h1>

      <div className='grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6'>
        {/* LISTA DE MARCAS */}
        <Card className='h-fit'>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle>Marcas</CardTitle>
            <Popover open={openMarcaPopover} onOpenChange={setOpenMarcaPopover}>
              <PopoverTrigger asChild>
                <Button
                  size='sm'
                  onClick={() => {
                    setMarcaParaEditar(null);
                    setOpenMarcaPopover(true);
                  }}
                >
                  <Plus /> Crear marca
                </Button>
              </PopoverTrigger>

              <MarcaPopover
                marca={marcaParaEditar ?? undefined}
                onSaved={() => setOpenMarcaPopover(false)}
              />
            </Popover>
          </CardHeader>

          <CardContent>
            <div className='space-y-1'>
              {marcas.map((marca) => (
                <Item
                  key={marca.id}
                  size='sm'
                  onClick={() => setSelectedMarca(marca.id)}
                  className={`${selectedMarca === marca.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                >
                  <ItemContent>
                    <ItemTitle>{marca.nombre}</ItemTitle>
                  </ItemContent>

                  <ItemActions>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon-sm'>
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => {
                            setMarcaParaEditar(marca);
                            setOpenMarcaPopover(true);
                          }}
                          onSelect={(e) => e.preventDefault()}
                        >
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant='destructive'
                          onClick={() =>
                            withAuth
                              .patch(ENDPOINTS.marcas.detail(marca.id), { activo: false })
                              .then(reloadAll)
                          }
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </ItemActions>
                </Item>
              ))}

              {marcas.length === 0 && (
                <p className='text-sm text-muted-foreground py-6 text-center'>
                  No hay marcas registradas.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* EQUIPOS POR MARCA */}
        <Card>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle>
              {selectedMarca
                ? `Equipos de ${marcas.find((m) => m.id === selectedMarca)?.nombre}`
                : 'Selecciona una marca'}
            </CardTitle>

            {selectedMarca && (
              <Button size='sm'>
                <Plus /> Agregar equipo
              </Button>
            )}
          </CardHeader>

          <CardContent>
            {!selectedMarca ? (
              <div className='py-6 text-center text-muted-foreground'>
                Selecciona una marca para ver sus equipos.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className='w-10'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equiposFiltrados.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell>{eq.nombre}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <EllipsisVertical className='w-5 h-5' />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              Editar
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              variant='destructive'
                              onClick={() =>
                                withAuth
                                  .patch(ENDPOINTS.equipos.detail(eq.id), { activo: false })
                                  .then(reloadAll)
                              }
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {equiposFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className='py-6 text-center text-muted-foreground'>
                        No hay equipos para esta marca
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MarcaPopover({ marca, onSaved }: { marca?: MarcaResponse; onSaved: () => void }) {
  const [nombre, setNombre] = useState(marca?.nombre || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      if (marca) await withAuth.patch(ENDPOINTS.marcas.detail(marca.id), { nombre });
      else await withAuth.post(ENDPOINTS.marcas.list, { nombre });

      router.invalidate();
      onSaved();
    } catch (error: any) {
      toast.error(error.response?.data?.nombre || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PopoverContent className='w-80 space-y-4'>
      <h4 className='leading-none font-medium'>{marca ? 'Editar esta marca' : 'Crear nueva marca'}</h4>

      <Input placeholder='Canon' defaultValue={nombre} onChange={(e) => setNombre(e.target.value)} />

      <Button className='w-full' disabled={loading} onClick={handleSave}>
        {loading && <Spinner />} Guardar
      </Button>
    </PopoverContent>
  );
}
