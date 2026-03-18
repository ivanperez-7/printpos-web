import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { fetchClientById } from '@/api/catalogo';
import { ENDPOINTS } from '@/api/endpoints';
import { useCatalogs } from '@/hooks/use-catalogs';
import { withAuth } from '@/lib/auth';
import type { ClienteResponse, UsoEquipo } from '@/lib/types';

export const Route = createFileRoute('/_app/clients/$id')({
  component: ClienteDetailPage,
  loader: ({ params }) => fetchClientById(params.id),
});

function ClienteDetailPage() {
  const { cliente, equiposCliente } = Route.useLoaderData();
  const router = useRouter();

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => router.history.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-2xl'>{cliente.nombre}</h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6'>
        <ClienteForm cliente={cliente} onSuccess={router.invalidate} />

        <EquiposClienteCard
          clienteId={cliente.id}
          equiposCliente={equiposCliente}
          onSuccess={router.invalidate}
        />
      </div>
    </div>
  );
}

function ClienteForm({ cliente, onSuccess }: { cliente: ClienteResponse; onSuccess: () => void }) {
  const [form, setForm] = useState(cliente);

  const updateField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const save = () =>
    toast.promise(withAuth.patch(ENDPOINTS.clientes.detail(cliente.id), form).then(onSuccess), {
      loading: 'Guardando cliente...',
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del cliente</CardTitle>
      </CardHeader>

      <CardContent className='space-y-3'>
        <Input
          value={form.nombre}
          onChange={(e) => updateField('nombre', e.target.value)}
          onBlur={save}
          placeholder='Nombre'
        />

        <Input
          value={form.rfc || ''}
          onChange={(e) => updateField('rfc', e.target.value)}
          onBlur={save}
          placeholder='RFC'
        />

        <Input
          value={form.telefono || ''}
          onChange={(e) => updateField('telefono', e.target.value)}
          onBlur={save}
          placeholder='Teléfono'
        />

        <Input
          value={form.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          onBlur={save}
          placeholder='Email'
        />
      </CardContent>
    </Card>
  );
}

function EquiposClienteCard({
  clienteId,
  equiposCliente,
  onSuccess,
}: {
  clienteId: number;
  equiposCliente: UsoEquipo[];
  onSuccess: () => void;
}) {
  return (
    <Card>
      <CardHeader className='flex justify-between items-center'>
        <CardTitle>Equipos asignados</CardTitle>

        <AssignEquipoPopover clienteId={clienteId} onSuccess={onSuccess} />
      </CardHeader>

      <CardContent>
        <EquiposClienteTable equiposCliente={equiposCliente} onSuccess={onSuccess} />
      </CardContent>
    </Card>
  );
}

function AssignEquipoPopover({ clienteId, onSuccess }: { clienteId: number; onSuccess: () => void }) {
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [contador, setContador] = useState(0);
  const { equipos } = useCatalogs();

  const handleSave = () => {
    if (!equipoId) return;

    toast.promise(
      withAuth
        .post(ENDPOINTS.clientes.detail(clienteId) + 'equipos/', { equipoId, contador_uso: contador })
        .then(onSuccess),
      { loading: 'Asignando equipo...' },
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size='sm'>
          <Plus /> Asignar equipo
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-72 space-y-3'>
        <select
          className='w-full border rounded px-2 py-1'
          onChange={(e) => setEquipoId(Number(e.target.value))}
        >
          <option value=''>Seleccionar equipo</option>
          {equipos.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.nombre}
            </option>
          ))}
        </select>

        <Input
          type='number'
          value={contador}
          onChange={(e) => setContador(Number(e.target.value))}
          placeholder='Contador inicial'
        />

        <Button className='w-full' onClick={handleSave}>
          Guardar
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function EquiposClienteTable({
  equiposCliente,
  onSuccess,
}: {
  equiposCliente: UsoEquipo[];
  onSuccess: () => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Equipo</TableHead>
          <TableHead>Contador</TableHead>
          <TableHead className='w-10'></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {equiposCliente.map((ec) => (
          <TableRow key={ec.equipo__id}>
            <TableCell>{ec.equipo__id}</TableCell>
            <TableCell>{ec.contador_uso}</TableCell>

            <TableCell>
              <Button
                variant='ghost'
                size='icon'
                onClick={onSuccess}
                // withAuth.delete(ENDPOINTS.equiposCliente.detail(ec.equipo__id)).then(onSuccess)
              >
                <X />
              </Button>
            </TableCell>
          </TableRow>
        ))}

        {equiposCliente.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className='text-center py-6'>
              No hay equipos asignados
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
