import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ColumnDef } from '@tanstack/react-table';
import type { Cliente } from './types';

export const clientsColumns: ColumnDef<Cliente>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => {
      const nombreVal = row.getValue('nombre') as string;
      return (
        <div className='flex gap-2.5 items-center'>
          <Avatar>
            <AvatarFallback>{nombreVal[0].toLocaleUpperCase()}</AvatarFallback>
          </Avatar>
          {nombreVal}
        </div>
      );
    },
  },
  {
    accessorKey: 'telefono',
    header: 'Teléfono',
  },
  {
    accessorKey: 'correo',
    header: 'Correo',
  },
];
