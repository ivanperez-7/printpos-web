import { useForm, useStore } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { ArrowDownToDot, ArrowUpFromDot, X } from 'lucide-react';
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
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from './ui/separator';
import { Spinner } from './ui/spinner';

import { ENDPOINTS } from '@/api/endpoints';
import { useCatalogs } from '@/hooks/use-catalogs';
import { withAuth } from '@/lib/auth';
import { movimientoCreateSchema, type MovimientoResponse, type ProductoResponse } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function AddMovementForm({
  trigger,
  movimiento,
}: {
  trigger: React.ReactNode;
  movimiento?: MovimientoResponse;
}) {
  const [open, setOpen] = useState(false);
  const [scanCode, setScanCode] = useState('');
  const [searching, setSearching] = useState(false);

  const [productosMap, setProductosMap] = useState<Record<number, ProductoResponse>>({});
  const { users, clientes } = useCatalogs();
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

        const producto = data[0];
        setProductosMap((prev) => ({ ...prev, [producto.id]: producto }));
        form.setFieldValue('items', (prev) => [...prev, { producto_id: producto.id, cantidad: 1 }]);
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
        recibido_por_id: 0,
      },
      comentarios: '',
    } as z.input<typeof movimientoCreateSchema>,
    validators: { onSubmit: movimientoCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await withAuth.post(ENDPOINTS.movimientos.list, value);
        if (res.status === 200 || res.status === 201) {
          const mov = res.data as MovimientoResponse;
          toast.success(`¡Movimiento ${movimiento ? 'editado' : 'registrado'} correctamente!`, {
            action: {
              label: 'Ver',
              onClick: () => router.navigate({ to: '/movements/$id', params: { id: String(mov.id) } }),
            },
          });
          if(!movimiento) form.reset();
          setOpen(false);
          setScanCode('');
          router.invalidate();
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    },
  });

  const tipo = useStore(form.store, (state) => state.values.tipo);

  useEffect(() => {
    scanInputRef.current?.focus();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          }}
          className='space-y-6'
        >
          <FieldSet>
            <FieldGroup className='grid grid-cols-2 gap-4'>
              <form.Field name='tipo'>
                {(field) => (
                  <Field>
                    <FieldLabel>Tipo</FieldLabel>
                    <div className='flex gap-2'>
                      <Button
                        variant={field.state.value === 'entrada' ? 'default' : 'outline'}
                        onClick={() => field.handleChange('entrada')}
                      >
                        <ArrowDownToDot /> Entrada
                      </Button>
                      <Button
                        variant={field.state.value === 'salida' ? 'default' : 'outline'}
                        onClick={() => field.handleChange('salida')}
                      >
                        <ArrowUpFromDot /> Salida
                      </Button>
                    </div>
                  </Field>
                )}
              </form.Field>

              <div className='space-y-4'>
                <Field>
                  <FieldLabel htmlFor='sku'>SKU</FieldLabel>
                  <Input
                    id='sku'
                    ref={scanInputRef}
                    value={scanCode}
                    autoFocus
                    onChange={(e) => setScanCode(e.target.value)}
                    placeholder='Escanee el código...'
                  />
                </Field>
                <Button
                  variant='secondary'
                  className='w-full'
                  disabled={searching}
                  onClick={handleScanSubmit}
                >
                  Agregar
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>

          {/* TABLA DE ITEMS */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead className='w-10'></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <form.Field name='items' mode='array'>
                {(field) =>
                  field.state.value.length > 0 ? (
                    field.state.value.map(({ producto_id }, index) => {
                      const producto = productosMap[producto_id];
                      return (
                        <TableRow key={index}>
                          <TableCell>{producto.codigo_interno}</TableCell>
                          <TableCell>{producto.descripcion}</TableCell>
                          <TableCell>
                            <form.Field name={`items[${index}].cantidad`}>
                              {(subField) => (
                                <Input
                                  className='h-8 w-20'
                                  ghost
                                  defaultValue={subField.state.value}
                                  onChange={(e) => subField.handleChange(Number(e.target.value))}
                                />
                              )}
                            </form.Field>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              onClick={() => field.removeValue(index)}
                            >
                              <X />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className='text-muted-foreground'>
                        No hay productos
                      </TableCell>
                    </TableRow>
                  )
                }
              </form.Field>
            </TableBody>
          </Table>

          {tipo === 'entrada' && (
            <div className='grid grid-cols-2 gap-4 mt-4'>
              <form.Field name='detalle_entrada.numero_factura'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Número de factura</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field name='detalle_entrada.recibido_por_id'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Recibido por</FieldLabel>
                    <Select
                      value={field.state.value ? String(field.state.value) : ''}
                      onValueChange={(v) => field.handleChange(Number(v))}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder='Seleccione un usuario' />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>
          )}

          {tipo === 'salida' && (
            <div className='grid grid-cols-2 gap-4 mt-4'>
              <form.Field name='detalle_salida.cliente_id'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Cliente</FieldLabel>
                    <Select
                      value={field.state.value ? String(field.state.value) : ''}
                      onValueChange={(v) => field.handleChange(Number(v))}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder='Seleccione un cliente' />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Field name='detalle_salida.tecnico'>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Técnico</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='Nombre del técnico'
                    />
                  </Field>
                )}
              </form.Field>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost'>Cerrar</Button>
            </DialogClose>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type='submit' disabled={isSubmitting} form='movement-form'>
                  {isSubmitting && <Spinner className='mr-2' />} Guardar movimiento
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
