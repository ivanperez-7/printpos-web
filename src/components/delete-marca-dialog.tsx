import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { ENDPOINTS } from '@/api/endpoints';
import { withAuth } from '@/lib/auth';

export function DeleteMarcaDialog({
  trigger,
  marcaId,
  onSuccess,
}: {
  trigger: React.ReactNode;
  marcaId: number;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (loading) return;
    setLoading(true);

    toast.promise(
      withAuth
        .patch(ENDPOINTS.marcas.detail(marcaId), { activo: false })
        .then((res) => {
          if (res.status === 200) onSuccess();
        })
        .catch((error) => toast.error(error.message))
        .finally(() => setLoading(false)),
      { loading: 'Guardando cambios...' },
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar marca</AlertDialogTitle>
          <AlertDialogDescription>
            Está a punto de eliminar esta marca. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
