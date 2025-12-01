import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import React, { useState } from 'react';
import { toast } from 'sonner';
import type z from 'zod';

// COMPONENTES DEL PROYECTO
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Field, FieldError, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Spinner } from './ui/spinner';

// OTRAS UTILIDADES
import { ENDPOINTS } from '@/api/endpoints';
import { useCatalogs } from '@/hooks/use-catalogs';
import { withAuth } from '@/lib/auth';
import { productoCreateSchema, type ProductoResponse } from '@/lib/types';

export function AddProductDialog({
  trigger,
  producto,
}: {
  trigger: React.ReactNode;
  producto?: ProductoResponse;
}) {
  const [marca, setMarca] = useState(producto?.equipo?.marca?.id ?? 1);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const { categorias, marcas, equipos } = useCatalogs();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      codigo_interno: producto?.codigo_interno ?? '',
      descripcion: producto?.descripcion ?? '',
      categoria: producto?.categoria.id ?? 1,
      equipo: producto?.equipo.id ?? 1,
      sku: producto?.sku ?? '',
      min_stock: producto?.min_stock ?? 0,
      unidad_medida: producto?.unidad_medida ?? 'pieza',
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
          if (res.status === 200 || res.status === 201) {
            toast.success(`¡Producto ${producto ? 'editado' : 'registrado'} correctamente!`);
            if (!producto) form.reset();
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
        <Separator />

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
                    <FieldError errors={field.state.meta.errors} />
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
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />
          </div>

          {/* Cantidad / Stock */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <form.Field
              name='sku'
              children={(field) => (
                <Field className='space-y-1'>
                  <FieldLabel>SKU</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
          </div>

          {/* Proveedor */}
          {/* <form.Field
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
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          /> */}

          <DialogFooter className='pt-2'>
            <DialogClose asChild>
              <Button variant='ghost' className='w-full md:w-auto'>
                Cancelar
              </Button>
            </DialogClose>
            <Button type='submit' disabled={loadingCreate} className='w-full md:w-auto'>
              Guardar {loadingCreate && <Spinner />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
