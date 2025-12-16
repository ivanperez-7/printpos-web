import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type z from 'zod';

// COMPONENTES DEL PROYECTO
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
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
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Spinner } from './ui/spinner';

// OTRAS UTILIDADES
import { ENDPOINTS } from '@/api/endpoints';
import { useCatalogs } from '@/hooks/use-catalogs';
import { withAuth } from '@/lib/auth';
import { productoCreateSchema, type ProductoResponse } from '@/lib/types';
import { cn } from '@/lib/utils';

export function AddProductDialog({
  trigger,
  producto,
}: {
  trigger: React.ReactNode;
  producto?: ProductoResponse;
}) {
  const [open, setOpen] = useState(false);
  const { categorias, proveedores } = useCatalogs();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      codigo_interno: producto?.codigo_interno ?? '',
      descripcion: producto?.descripcion ?? '',
      categoria_id: producto?.categoria.id,
      equipos_id: producto?.equipos?.map((e) => e.id) ?? [],
      proveedor_id: producto?.proveedor?.id,
      sku: producto?.sku ?? '',
      min_stock: producto?.min_stock ?? 0,
      status: producto?.status ?? 'activo',
    } as z.input<typeof productoCreateSchema>,
    validators: { onSubmit: productoCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = producto
          ? await withAuth.patch(ENDPOINTS.products.detail(producto.id), value)
          : await withAuth.post(ENDPOINTS.products.list, value);

        if (res.status === 200 || res.status === 201) {
          toast.success(`¡Producto ${producto ? 'editado' : 'registrado'} correctamente!`);
          if (!producto) form.reset();
          setOpen(false);
          router.invalidate();
        }
      } catch (error: any) {
        toast.error(error.response?.data?.codigo_interno || error.message);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className='max-w-full md:max-w-xl lg:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{producto ? 'Editar este producto' : 'Agregar nuevo producto'}</DialogTitle>
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
            <form.Field name='codigo_interno'>
              {(field) => (
                <Field className='space-y-1'>
                  <FieldLabel htmlFor={field.name}>Código interno</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name='descripcion'>
              {(field) => (
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
            </form.Field>
          </div>

          {/* Marca / Categoría */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Categoría */}
            <form.Field name='categoria_id'>
              {(field) => (
                <Field className='space-y-1'>
                  <FieldLabel htmlFor={field.name}>Categoría</FieldLabel>
                  <Select
                    value={field.state.value ? String(field.state.value) : ''}
                    onValueChange={(v) => field.handleChange(Number(v))}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder='Seleccione una categoría' />
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
              )}
            </form.Field>

            <form.Field name='min_stock'>
              {(field) => (
                <Field className='space-y-1'>
                  <FieldLabel htmlFor={field.name}>Stock mínimo</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                    <InputGroupAddon align='inline-end'>unidades</InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </div>

          {/* Cantidad / Stock */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <form.Field name='sku'>
              {(field) => (
                <Field className='space-y-1'>
                  <FieldLabel htmlFor={field.name}>SKU</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name='proveedor_id'>
              {(field) => (
                <Field className='space-y-1'>
                  <FieldLabel htmlFor={field.name}>Proveedor</FieldLabel>
                  <Select
                    value={field.state.value ? String(field.state.value) : ''}
                    onValueChange={(v) => field.handleChange(Number(v) || null)}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder='Seleccione un proveedor' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>---------</SelectItem>
                      {proveedores.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
              }
            </form.Field>
          </div>

          <form.Field name='equipos_id'>
            {(field) => (
              <Field className='space-y-1'>
                <FieldLabel className='text-xl'>Equipos compatibles</FieldLabel>
                <EquipoSelector
                  selectedEquipos={field.state.value}
                  onEquiposChange={field.handleChange}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <DialogFooter className='pt-2'>
            <DialogClose asChild>
              <Button variant='ghost' className='w-full md:w-auto'>
                Cancelar
              </Button>
            </DialogClose>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full md:w-auto'
                  form='product-form'
                >
                  {isSubmitting && <Spinner />} Guardar
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EquipoSelector({
  selectedEquipos,
  onEquiposChange,
}: {
  selectedEquipos: number[];
  onEquiposChange: (nuevos: number[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedMarca, setSelectedMarca] = useState<number | undefined>();
  const { marcas, equipos } = useCatalogs();

  const equiposFiltrados = useMemo(() => {
    return equipos.filter((eq) => {
      const coincideMarca = selectedMarca ? eq.marca.id === selectedMarca : true;
      const coincideBusqueda = eq.nombre.toLowerCase().includes(search.toLowerCase());
      return coincideMarca && coincideBusqueda;
    });
  }, [equipos, selectedMarca, search]);

  return (
    <div className='space-y-4'>
      {/* Selector de marcas */}
      <div className='flex flex-wrap gap-2'>
        {marcas.map((m) => (
          <Badge
            key={m.id}
            variant={selectedMarca === m.id ? 'default' : 'secondary'}
            className={cn(
              'cursor-pointer px-3 py-1 rounded-md',
              selectedMarca === m.id && 'ring-2 ring-primary'
            )}
            onClick={() => setSelectedMarca(selectedMarca === m.id ? undefined : m.id)}
          >
            {m.nombre}
          </Badge>
        ))}
      </div>

      <Input
        placeholder='Buscar por nombre...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Selector de equipos */}
      <ScrollArea className='h-48 rounded-md border p-3'>
        <div className='space-y-2'>
          {equiposFiltrados.length === 0 && (
            <p className='text-sm text-muted-foreground'>No hay resultados.</p>
          )}

          {equiposFiltrados.map((eq) => (
            <label key={eq.id} className='flex items-center gap-2 text-sm cursor-pointer'>
              <Checkbox
                checked={selectedEquipos.includes(eq.id)}
                onCheckedChange={(checked) => {
                  if (checked == true) onEquiposChange([...selectedEquipos, eq.id]);
                  else onEquiposChange(selectedEquipos.filter((id) => id !== eq.id));
                }}
              />
              {eq.nombre}{' '}
              {!selectedMarca && (
                <span className='text-xs text-muted-foreground'>{eq.marca.nombre}</span>
              )}
            </label>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
