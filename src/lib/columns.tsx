import { type Cliente } from '@/api/clientes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ColumnDef } from '@tanstack/react-table';

export const clientsColumns: ColumnDef<Cliente>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => {
      const nombreVal = row.getValue('nombre') as string;
      return (
        <div className='flex gap-2.5 items-center'>
          <Avatar>
            <AvatarFallback>{nombreVal[0]}</AvatarFallback>
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
