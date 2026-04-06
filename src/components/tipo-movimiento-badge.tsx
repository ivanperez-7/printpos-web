import { ArrowDownToDot, ArrowUpFromDot } from 'lucide-react';

import { Badge } from './ui/badge';

export default function TipoMovimientoBadge({ tipo }: { tipo: 'entrada' | 'salida' }) {
  return tipo === 'entrada' ? (
    <Badge variant='default'>
      <ArrowDownToDot />
      Entrada
    </Badge>
  ) : (
    <Badge variant='destructive'>
      <ArrowUpFromDot />
      Salida
    </Badge>
  );
}
