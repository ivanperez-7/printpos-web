import { useForm, useStore } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';
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
import {
  productoCreateSchema,
  type EquipoResponse,
  type MarcaResponse,
  type ProductoResponse,
} from '@/lib/types';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Checkbox } from './ui/checkbox';

export function AddProductDialog({
  trigger,
  producto,
}: {
  trigger: React.ReactNode;
  producto?: ProductoResponse;
}) {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const { categorias, marcas, equipos } = useCatalogs();
  const router = useRouter();

  const [marca, setMarca] = useState<number | undefined>(producto?.categoria?.id);

  const form = useForm({
    defaultValues: {
      codigo_interno: producto?.codigo_interno ?? '',
      descripcion: producto?.descripcion ?? '',
      categoria_id: producto?.categoria.id,
      equipos_id: producto?.equipos?.map((e) => e.id) ?? [],
      sku: producto?.sku ?? '',
      min_stock: producto?.min_stock ?? 0,
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
        .catch((error) => toast.error(error.response?.data?.codigo_interno || error.message))
        .finally(() => setLoadingCreate(false));
    },
  });

  const selectedEquipos = useStore(form.store, (state) => state.values.equipos_id);

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

          {/* Marca / Categoría */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Categoría */}
            <form.Field
              name='categoria_id'
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field className='space-y-1' data-invalid={isInvalid}>
                    <FieldLabel htmlFor='select-categoria'>Categoría</FieldLabel>
                    <Select
                      value={field.state.value ? String(field.state.value) : undefined}
                      onValueChange={(v) => field.handleChange(Number(v))}
                    >
                      <SelectTrigger id='select-categoria' aria-invalid={isInvalid} className='w-full'>
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
                );
              }}
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
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
          </div>

          {/* Cantidad / Stock */}
          <div className='grid grid-cols-1 gap-4'>
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

          <form.Field
            name='equipos_id'
            children={(field) => (
              <Field className='space-y-1'>
                <FieldLabel className='text-xl'>Equipos compatibles</FieldLabel>

                <EquipoSelector
                  marcas={marcas}
                  equipos={equipos}
                  selectedMarca={marca}
                  setSelectedMarca={setMarca}
                  selectedEquipos={selectedEquipos}
                  onEquiposChange={(nuevos) => form.setFieldValue('equipos_id', nuevos)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

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

function EquipoSelector({
  marcas,
  equipos,
  selectedMarca,
  setSelectedMarca,
  selectedEquipos,
  onEquiposChange,
}: {
  marcas: MarcaResponse[];
  equipos: EquipoResponse[];
  selectedMarca: number | undefined;
  setSelectedMarca: (id: number | undefined) => void;
  selectedEquipos: number[];
  onEquiposChange: (nuevos: number[]) => void;
}) {
  const [search, setSearch] = useState('');

  // Equipos filtrados
  const equiposFiltrados = useMemo(() => {
    return equipos.filter((eq) => {
      const coincideMarca = selectedMarca ? eq.marca.id === selectedMarca : true;
      const coincideBusqueda = eq.nombre.toLowerCase().includes(search.toLowerCase());
      return coincideMarca && coincideBusqueda;
    });
  }, [equipos, selectedMarca, search]);

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
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
      </div>

      <div className='space-y-2'>
        <Input
          placeholder='Buscar por nombre...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className='h-48 rounded-md border p-3'>
        <div className='space-y-2'>
          {equiposFiltrados.length === 0 && (
            <p className='text-sm text-muted-foreground'>No hay resultados.</p>
          )}

          {equiposFiltrados.map((eq) => (
            <label key={eq.id} className='flex items-center gap-2 text-sm cursor-pointer'>
              <Checkbox
                checked={selectedEquipos.includes(eq.id)}
                className='h-4 w-4'
                onCheckedChange={(checked) => {
                  if (checked == true) onEquiposChange([...selectedEquipos, eq.id]);
                  else onEquiposChange(selectedEquipos.filter((id) => id !== eq.id));
                }}
              />
              {eq.nombre}
            </label>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
