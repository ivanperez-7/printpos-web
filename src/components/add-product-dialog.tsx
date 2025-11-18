import { ENDPOINTS } from '@/api/endpoints';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { withAuth } from '@/lib/auth';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { Camera, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from './ui/field';
import { Spinner } from './ui/spinner';
import { productoCreateSchema } from '@/lib/types';

export function AddProductDialog({ trigger }: { trigger: React.ReactNode }) {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const router = useRouter();

  const [marca, setMarca] = useState('KONICA');
  const [categoria, setCategoria] = useState('Consumible');
  const [modelo, setModelo] = useState<string | null | undefined>('C3300');
  const [unidad, setUnidad] = useState('pieza');
  const [activo, setActivo] = useState(true);

  const form = useForm({
    defaultValues: {
      codigo_interno: '',
      descripcion: '',
      categoria: categoria,
      marca: marca,
      serie_lote: '',
      cantidad_disponible: 0,
      min_stock: 0,
      unidad: unidad,
      proveedor: '',
      precio_compra: 0,
      precio_venta: 0,
      status: 'activo',
      notas: '',
    },
    onSubmit: async ({ value }) => {
      if (loadingCreate) return;
      setLoadingCreate(true);

      const parsed = productoCreateSchema.safeParse({
        ...value,
        categoria,
        marca,
        nombre_modelo: modelo,
        unidad,
        status: activo ? 'activo' : 'inactivo',
      });

      if (!parsed.success) {
        toast.error('Corrige los errores en el formulario antes de guardar');
        setLoadingCreate(false);
        return;
      }

      const payload = parsed.data;

      withAuth
        .post(ENDPOINTS.products.list, payload)
        .then((res) => {
          if (res.status === 201) {
            toast.success('¡Producto registrado correctamente!');
            form.reset();
            // try to invalidate routes if router supports it
            try {
              (router as any).invalidate?.();
            } catch {}
          }
        })
        .catch((error) => toast.error(error.message))
        .finally(() => setLoadingCreate(false));
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='lg:max-w-2xl overflow-y-scroll max-h-screen'>
        <DialogHeader>
          <DialogTitle>Agregar nuevo producto</DialogTitle>
          <DialogDescription>Completa los datos del nuevo producto</DialogDescription>
        </DialogHeader>

        <form
          id='product-form'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className='grid gap-3 py-2'>
            <FieldSet>
              <FieldGroup>
                {/* Código interno */}
                <form.Field
                  name='codigo_interno'
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Código interno</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Descripción */}
                <form.Field
                  name='descripcion'
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Marca / Categoría / Modelo */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                  <div>
                    <FieldLabel>Marca</FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline'>
                          {marca} <ChevronDown />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {['KONICA', 'KATUN', 'FUJI'].map((m) => (
                          <DropdownMenuItem key={m} onClick={() => setMarca(m)}>
                            {m}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <FieldLabel>Categoría</FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline'>
                          {categoria} <ChevronDown />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {['Consumible', 'Repuesto'].map((c) => (
                          <DropdownMenuItem key={c} onClick={() => setCategoria(c)}>
                            {c}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <FieldLabel>Modelo</FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline'>
                          {modelo} <ChevronDown />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {['C3300', '1120', 'X400'].map((m) => (
                          <DropdownMenuItem key={m} onClick={() => setModelo(m)}>
                            {m}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Serie/Lote */}
                <form.Field
                  name='serie_lote'
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Número de serie / lote</FieldLabel>
                      <Input
                        id={field.name}
                        placeholder='Número de serie o lote'
                        value={field.state.value ?? ''}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Cantidad / Stock mínimo / Unidad */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                  <form.Field
                    name='cantidad_disponible'
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Cantidad disponible</FieldLabel>
                        <Input
                          id={field.name}
                          type='number'
                          value={field.state.value}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  <form.Field
                    name='min_stock'
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Stock mínimo</FieldLabel>
                        <Input
                          id={field.name}
                          type='number'
                          value={field.state.value}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  <div>
                    <FieldLabel>Unidad</FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline'>
                          {unidad} <ChevronDown />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {['pieza', 'caja', 'kg'].map((u) => (
                          <DropdownMenuItem key={u} onClick={() => setUnidad(u)}>
                            {u}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Precio compra / venta */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  <form.Field
                    name='precio_compra'
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Precio de compra</FieldLabel>
                        <Input
                          id={field.name}
                          type='number'
                          step='0.01'
                          value={field.state.value ?? ''}
                          onChange={(e) =>
                            field.handleChange(e.target.value ? parseFloat(e.target.value) : 0)
                          }
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                  <form.Field
                    name='precio_venta'
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Precio de venta</FieldLabel>
                        <Input
                          id={field.name}
                          type='number'
                          step='0.01'
                          value={field.state.value ?? ''}
                          onChange={(e) =>
                            field.handleChange(e.target.value ? parseFloat(e.target.value) : 0)
                          }
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>

                {/* Notas */}
                <form.Field
                  name='notas'
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Notas</FieldLabel>
                      <Input
                        id={field.name}
                        placeholder='Información adicional (opcional)'
                        value={field.state.value ?? ''}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </Field>
                  )}
                />

                {/* Estado */}
                <div className='flex items-center gap-2 mt-2'>
                  <FieldLabel>Activo</FieldLabel>
                  <Switch checked={activo} onCheckedChange={setActivo} />
                </div>
              </FieldGroup>
            </FieldSet>
          </div>

          {/* Footer */}
          <DialogFooter>
            <div className='flex flex-col sm:flex-row gap-2 w-full'>
              <Button variant='ghost' className='mr-auto w-full sm:w-auto'>
                <Camera className='inline-block mr-2' /> Generar código QR
              </Button>

              <Button
                type='submit'
                form='product-form'
                variant='default'
                className='w-full sm:w-auto'
                disabled={loadingCreate || !form.state.canSubmit}
              >
                Guardar {loadingCreate && <Spinner />}
              </Button>

              <DialogClose asChild>
                <Button variant='outline' className='w-full sm:w-auto'>
                  Cancelar
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
