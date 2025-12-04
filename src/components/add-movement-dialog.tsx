import { Trash } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from './ui/separator';
import { Spinner } from './ui/spinner';

import { ENDPOINTS } from '@/api/endpoints';
import { withAuth } from '@/lib/auth';
import type { ProductoResponse } from '@/lib/types';

type MovimientoItem = ProductoResponse & { cantidad: number };

export function AddMovementForm({ trigger }: { trigger: React.ReactNode }) {
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [scanCode, setScanCode] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [items, setItems] = useState<MovimientoItem[]>([]);
  const [searching, setSearching] = useState(false);

  // referencia del input para autofocus
  const scanInputRef = useRef<HTMLInputElement>(null);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;
    setSearching(true);

    withAuth
      .get(ENDPOINTS.products.list, { params: { sku: encodeURIComponent(scanCode) } })
      .then((res) => res.data as MovimientoItem[])
      .then((data) => {
        if (!data.length) throw new Error('No se encontró ningún producto con este código');
        const obj = data[0];
        obj.cantidad = cantidad;

        setItems((prev) => [...prev, obj]);
        setScanCode('');
        setCantidad(1);
        scanInputRef.current?.focus();
      })
      .catch((error) => {
        toast.error(error.message);
        setScanCode('');
        scanInputRef.current?.focus();
      })
      .finally(() => setSearching(false));
  };

  const handleSave = () => {
    let url;
    if (tipo === 'entrada') url = ENDPOINTS.movimientos.entradas.list;
    else url = ENDPOINTS.movimientos.salidas.list;

    withAuth
      .post(url, { items })
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          toast.success('Movimiento registrado (simulación)');
          setItems([]);
          setScanCode('');
          setCantidad(1);
        }
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setSearching(false));
  };

  useEffect(() => {
    scanInputRef.current?.focus();
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className='max-w-full md:max-w-xl lg:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
        </DialogHeader>
        <Separator />

        <form onSubmit={handleScanSubmit} className='grid gap-4'>
          <FieldSet>
            <FieldGroup className='grid grid-cols-2 gap-4'>
              <Field>
                <FieldLabel>Tipo</FieldLabel>
                <div className='flex gap-2'>
                  <Button
                    variant={tipo === 'entrada' ? 'default' : 'outline'}
                    onClick={() => setTipo('entrada')}
                    type='button'
                  >
                    Entrada
                  </Button>
                  <Button
                    variant={tipo === 'salida' ? 'default' : 'outline'}
                    onClick={() => setTipo('salida')}
                    type='button'
                  >
                    Salida
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel>Código / Escaneo</FieldLabel>
                <Input
                  ref={scanInputRef}
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  placeholder='Escanee el código...'
                />
              </Field>

              <Field>
                <FieldLabel>Cantidad</FieldLabel>
                <Input
                  type='number'
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </Field>

              <div className='flex items-end'>
                <Button type='submit' className='w-full' disabled={searching}>
                  Agregar {searching && <Spinner />}
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>
        </form>

        {/* TABLA DE ITEMS AGREGADOS */}
        <div className='rounded-md p-3 max-h-80 overflow-y-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.codigo_interno}</TableCell>
                  <TableCell>{item.descripcion}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>
                    <Button
                      variant='destructive'
                      size='icon-sm'
                      onClick={() => setItems((prev) => prev.filter((_, prevIdx) => prevIdx !== i))}
                    >
                      <Trash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className='text-center text-gray-500 py-3'>
                    No hay productos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost'>Cerrar</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={items.length === 0}>
            Registrar movimiento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
