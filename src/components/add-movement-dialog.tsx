import { useForm, useStore } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { Trash } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type z from 'zod';

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
import { movimientoCreateSchema, type MovimientoCreate, type ProductoResponse } from '@/lib/types';

export function AddMovementForm({
  trigger,
  movimiento,
}: {
  trigger: React.ReactNode;
  movimiento?: MovimientoCreate;
}) {
  const [scanCode, setScanCode] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // referencia del input para autofocus
  const scanInputRef = useRef<HTMLInputElement>(null);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;
    setSearching(true);

    withAuth
      .get(ENDPOINTS.products.list, { params: { sku: encodeURIComponent(scanCode) } })
      .then((res) => res.data as ProductoResponse[])
      .then((data) => {
        if (!data.length) throw new Error('No se encontró ningún producto con este código');
        form.setFieldValue('items', (prev) => [...prev, { producto_id: data[0].id, cantidad }]);
        setCantidad(1);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => {
        setSearching(false);
        setScanCode('');
        scanInputRef.current?.focus();
      });
  };

  const form = useForm({
    defaultValues: {
      tipo: movimiento?.tipo ?? 'entrada',
      items: movimiento?.items ?? [],
      detalle_entrada: {
        numero_factura: '',
        recibido_por_id: 1,
      },
      comentarios: '',
    } as z.input<typeof movimientoCreateSchema>,
    validators: { onSubmit: movimientoCreateSchema },
    onSubmit: async ({ value }) => {
      if (!value.items.length) return;
      setLoading(true);

      withAuth
        .post(ENDPOINTS.movimientos.list, value)
        .then((res) => {
          if (res.status === 200 || res.status === 201) {
            toast.success('Movimiento registrado');
            form.reset();
            router.invalidate();
          }
        })
        .catch((error) => toast.error(error.message))
        .finally(() => {
          setSearching(false);
          setLoading(false);
        });
    },
  });

  const items = useStore(form.store, (state) => state.values.items);
  const tipo = useStore(form.store, (state) => state.values.tipo);

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

        <form
          id='movement-form'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
            console.log(form.state.errors);
          }}
          className='grid gap-4'
        >
          <FieldSet>
            <FieldGroup className='grid grid-cols-2 gap-4'>
              <form.Field
                name='tipo'
                children={(field) => (
                  <Field>
                    <FieldLabel>Tipo</FieldLabel>
                    <div className='flex gap-2'>
                      <Button
                        variant={field.state.value === 'entrada' ? 'default' : 'outline'}
                        onClick={() => field.handleChange('entrada')}
                        type='button'
                      >
                        Entrada
                      </Button>
                      <Button
                        variant={field.state.value === 'salida' ? 'default' : 'outline'}
                        onClick={() => field.handleChange('salida')}
                        type='button'
                      >
                        Salida
                      </Button>
                    </div>
                  </Field>
                )}
              />

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
                <Button className='w-full' disabled={searching} onClick={handleScanSubmit}>
                  {searching && <Spinner />} Agregar
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>

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
                    <TableCell>{item.producto_id}</TableCell>
                    <TableCell>{item.producto_id}</TableCell>
                    <TableCell>{item.cantidad}</TableCell>
                    <TableCell>
                      <Button
                        variant='destructive'
                        size='icon-sm'
                        onClick={() =>
                          form.setFieldValue('items', (prev) =>
                            prev.filter((_, prevIdx) => prevIdx !== i)
                          )
                        }
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center text-gray-500 py-3'>
                      No hay productos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {tipo === 'entrada' && (
            <div className='grid grid-cols-2 gap-4 mt-4'>
              <form.Field
                name='detalle_entrada.numero_factura'
                children={(field) => (
                  <Field>
                    <FieldLabel>Número de factura</FieldLabel>
                    <Input
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='ABC-123'
                    />
                  </Field>
                )}
              />

              <form.Field
                name='detalle_entrada.recibido_por_id'
                children={(field) => (
                  <Field>
                    <FieldLabel>Recibido por (User ID)</FieldLabel>
                    <Input
                      type='number'
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='ID usuario'
                    />
                  </Field>
                )}
              />
            </div>
          )}

          {tipo === 'salida' && (
            <div className='grid grid-cols-2 gap-4 mt-4'>
              <form.Field
                name='detalle_salida.cliente_id'
                children={(field) => (
                  <Field>
                    <FieldLabel>Cliente</FieldLabel>
                    <Input
                      type='number'
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      placeholder='ID cliente'
                    />
                  </Field>
                )}
              />

              <form.Field
                name='detalle_salida.tecnico'
                children={(field) => (
                  <Field>
                    <FieldLabel>Técnico</FieldLabel>
                    <Input
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='Nombre del técnico'
                    />
                  </Field>
                )}
              />

              <form.Field
                name='detalle_salida.requiere_aprobacion'
                children={(field) => (
                  <Field>
                    <FieldLabel>Requiere aprobación</FieldLabel>
                    <Button
                      variant={field.state.value ? 'default' : 'outline'}
                      onClick={() => field.handleChange(!field.state.value)}
                      type='button'
                    >
                      {field.state.value ? 'Sí' : 'No'}
                    </Button>
                  </Field>
                )}
              />
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Cerrar</Button>
            </DialogClose>
            <Button type='submit' disabled={items.length === 0}>
              {loading && <Spinner />} Registrar movimiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
