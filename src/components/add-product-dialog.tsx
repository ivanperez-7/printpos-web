import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import React, { useState } from 'react';
import { toast } from 'sonner';
import type z from 'zod';

// COMPONENTES DEL PROYECTO
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

// OTRAS UTILIDADES
import { ENDPOINTS } from '@/api/endpoints';
import { withAuth } from '@/lib/auth';
import {
  productoCreateSchema,
  type CategoriaResponse,
  type EquipoResponse,
  type MarcaResponse,
  type ProductoResponse,
  type ProveedorResponse,
} from '@/lib/types';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './ui/input-group';

const unidades = [
  { value: 'pieza', label: 'Pieza' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'lt', label: 'Litro' },
];

export function AddProductDialog({
  trigger,
  categorias,
  marcas,
  equipos,
  proveedores,
  producto,
}: {
  trigger: React.ReactNode;
  categorias: CategoriaResponse[];
  marcas: MarcaResponse[];
  equipos: EquipoResponse[];
  proveedores: ProveedorResponse[];
  producto?: ProductoResponse;
}) {
  const [marca, setMarca] = useState(1);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      codigo_interno: producto?.codigo_interno ?? '',
      descripcion: producto?.descripcion ?? '',
      serie_lote: producto?.serie_lote ?? '',
      equipo: producto?.equipo ?? 1,
      categoria: producto?.categoria ?? 1,
      cantidad_disponible: producto?.cantidad_disponible ?? 0,
      min_stock: producto?.min_stock ?? 0,
      unidad: producto?.unidad ?? 'pieza',
      precio_compra: producto?.precio_compra ?? 0,
      precio_venta: producto?.precio_venta ?? 0,
      notas: producto?.notas ?? '',
      status: producto?.status ?? 'activo',
    } as z.input<typeof productoCreateSchema>,
    validators: { onSubmit: productoCreateSchema },
    onSubmit: async ({ value }) => {
      if (loadingCreate) return;
      setLoadingCreate(true);

      (producto
        ? withAuth.patch(ENDPOINTS.products.detail(producto.id), value)
        : withAuth.post(ENDPOINTS.products.list, value)
      )
        .then((res) => {
          if (res.status === 201) {
            toast.success('¡Producto registrado correctamente!');
            form.reset();
            router.invalidate();
          }
        })
        .catch((error) => toast.error(error.message))
        .finally(() => setLoadingCreate(false));
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className='max-w-full md:max-w-xl lg:max-w-2xl'>
        <DialogHeader className='space-y-1'>
          <DialogTitle className='text-lg font-semibold'>
            {producto ? 'Editar este producto' : 'Agregar nuevo producto'}
          </DialogTitle>
        </DialogHeader>

        <form
          id='product-form'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='space-y-6'
        >
          {/* Datos generales */}
          <div className='space-y-4'>
            <form.Field
              name='codigo_interno'
              children={(field) => (
                <Field className='space-y-1'>
                  <FieldLabel htmlFor={field.name}>Código interno</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className='w-full'
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <form.Field
              name='descripcion'
              children={(field) => (
                <Field className='space-y-1'>
                  <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
          </div>

          {/* Marca / Categoría / Equipo */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Marca */}
            <Field className='space-y-1'>
              <FieldLabel htmlFor='select-marca'>Marca</FieldLabel>
              <Select value={String(marca)} onValueChange={(v) => setMarca(Number(v))}>
                <SelectTrigger id='select-marca' className='w-full'>
                  <SelectValue placeholder='Marca' />
                </SelectTrigger>
                <SelectContent>
                  {marcas.map((eq) => (
                    <SelectItem key={eq.id} value={String(eq.id)}>
                      {eq.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Equipo */}
            <form.Field
              name='equipo'
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field className='space-y-1' data-invalid={isInvalid}>
                    <FieldLabel htmlFor='select-equipo'>Equipo</FieldLabel>
                    <Select
                      value={String(field.state.value)}
                      onValueChange={(v) => field.handleChange(Number(v))}
                    >
                      <SelectTrigger id='select-equipo' aria-invalid={isInvalid} className='w-full'>
                        <SelectValue placeholder='Equipo' />
                      </SelectTrigger>
                      <SelectContent>
                        {equipos
                          .filter((eq) => eq.marca.id === marca)
                          .map((eq) => (
                            <SelectItem key={eq.id} value={String(eq.id)}>
                              {eq.nombre}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />

            {/* Categoría */}
            <form.Field
              name='categoria'
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field className='space-y-1' data-invalid={isInvalid}>
                    <FieldLabel htmlFor='select-categoria'>Categoría</FieldLabel>
                    <Select
                      value={String(field.state.value)}
                      onValueChange={(v) => field.handleChange(Number(v))}
                    >
                      <SelectTrigger id='select-categoria' aria-invalid={isInvalid} className='w-full'>
                        <SelectValue placeholder='Categoría' />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />
          </div>

          {/* Serie/Lote */}
          <form.Field
            name='serie_lote'
            children={(field) => (
              <Field className='space-y-1'>
                <FieldLabel htmlFor={field.name}>Número de serie/lote</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          {/* Cantidad / Stock / Unidad */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <form.Field
              name='cantidad_disponible'
              children={(field) => (
                <Field className='space-y-1'>
                  <FieldLabel>Cantidad disponible</FieldLabel>
                  <Input
                    type='number'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Field>
              )}
            />

            <form.Field
              name='min_stock'
              children={(field) => (
                <Field className='space-y-1'>
                  <FieldLabel>Stock mínimo</FieldLabel>
                  <Input
                    type='number'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Field>
              )}
            />

            <form.Field
              name='unidad'
              children={(field) => (
                <Field className='space-y-1'>
                  <FieldLabel htmlFor='select-unidad'>Unidad</FieldLabel>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger id='select-unidad' className='w-full'>
                      <SelectValue placeholder='Unidad' />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          {/* Precios */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <form.Field
              name='precio_compra'
              children={(field) => (
                <Field className='space-y-1'>
                  <FieldLabel>Precio compra</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>$</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder='0.00'
                      type='number'
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                    <InputGroupAddon align='inline-end'>
                      <InputGroupText>MXN</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              )}
            />

            <form.Field
              name='precio_venta'
              children={(field) => (
                <Field className='space-y-1'>
                  <FieldLabel>Precio venta</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>$</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder='0.00'
                      type='number'
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                    <InputGroupAddon align='inline-end'>
                      <InputGroupText>MXN</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              )}
            />
          </div>

          {/* Proveedor */}
          <form.Field
            name='proveedor'
            children={(field) => (
              <Field className='space-y-1'>
                <FieldLabel htmlFor='select-proveedor'>Proveedor</FieldLabel>
                <Select
                  value={String(field.state.value)}
                  onValueChange={(v) => field.handleChange(Number(v))}
                >
                  <SelectTrigger id='select-proveedor' className='w-full'>
                    <SelectValue placeholder='Proveedor' />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          {/* Notas */}
          <form.Field
            name='notas'
            children={(field) => (
              <Field className='space-y-1'>
                <FieldLabel>Notas</FieldLabel>
                <Input
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          />

          <DialogFooter className='pt-2'>
            <Button
              type='submit'
              disabled={loadingCreate || !form.state.canSubmit}
              className='w-full md:w-auto'
            >
              Guardar {loadingCreate && <Spinner />}
            </Button>
            <DialogClose asChild>
              <Button variant='ghost' className='w-full md:w-auto'>
                Cancelar
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
