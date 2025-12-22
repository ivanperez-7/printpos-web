import { createFileRoute, ErrorComponent, useRouter } from '@tanstack/react-router';
import { EllipsisVertical, Plus, X } from 'lucide-react';
import { useState } from 'react';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { ENDPOINTS } from '@/api/endpoints';
import { useCatalogs } from '@/hooks/use-catalogs';
import { withAuth } from '@/lib/auth';

export const Route = createFileRoute('/_app/equipos')({
  component: EquiposPage,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

function EquiposPage() {
  const { marcas, equipos } = useCatalogs();
  const [selectedMarca, setSelectedMarca] = useState<number | null>(null);
  const router = useRouter();

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
                    <Button variant='ghost' size='icon-sm'>
                      <X />
                    </Button>
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
              <Input
                ghost
                defaultValue={marcas.find((m) => m.id === selectedMarca)?.nombre}
                onBlur={(e) =>
                  selectedMarca &&
                  withAuth
                    .patch(ENDPOINTS.marcas.detail(selectedMarca), { nombre: e.target.value })
                    .then(() => router.invalidate())
                }
              />
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
