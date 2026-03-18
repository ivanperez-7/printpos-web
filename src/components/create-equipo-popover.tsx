import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { ENDPOINTS } from '@/api/endpoints';
import { withAuth } from '@/lib/auth';

export function CreateEquipoPopover({
  marcaId,
  onSuccess,
}: {
  marcaId: number;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nombre.trim()) return;
    setLoading(true);

    toast.promise(
      withAuth
        .post(ENDPOINTS.equipos.list, { nombre, marca_id: marcaId })
        .then(() => {
          setNombre('');
          setOpen(false);
          onSuccess();
        })
        .finally(() => {
          setLoading(false);
        }),
      { loading: 'Creando equipo...' },
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size='sm'>
          <Plus /> Agregar equipo
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-64 space-y-3'>
        <Input
          placeholder='Nombre del equipo'
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />

        <Button size='sm' className='w-full' onClick={handleSave} disabled={loading || !nombre.trim()}>
          Guardar
        </Button>
      </PopoverContent>
    </Popover>
  );
}
