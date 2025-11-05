import { clientSchema, fetchAllClientes } from '@/api/clientes';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

import { ENDPOINTS } from '@/api/endpoints';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { withAuth } from '@/lib/auth';
import { clientsColumns } from '@/lib/columns';

export const Route = createFileRoute('/_app/clients')({
  component: RouteComponent,
  loader: fetchAllClientes,
});

function RouteComponent() {
  const [loading, setLoading] = useState(false);
  const clientesPromise = Route.useLoaderData();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      nombre: '',
      telefono: '',
      correo: '',
      direccion: '',
      rfc: '',
      cliente_especial: false,
      descuentos: '',
      is_active: true,
    },
    validators: {
      onChange: clientSchema,
      onSubmit: clientSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading) return;
      setLoading(true);

      withAuth
        .post(ENDPOINTS.clients.list, value)
        .then((res) => {
          if (res.status === 201) {
            toast.success('Cliente registrado correctamente.');
            form.reset();
            router.invalidate();
          }
        })
        .catch((error) => toast.error(error.message))
        .finally(() => setLoading(false));
    },
  });

  return (
    <>
      <h1 className='font-bold text-3xl'>Mis clientes</h1>
      <div className='container mx-auto py-6'>
        <DataTable columns={clientsColumns} data={clientesPromise} />
      </div>

      <h1 className='mt-5 text-xl font-bold'>¿Registrar nuevo cliente?</h1>
      <span className='text-gray-500 text-sm'>Sin problema</span>

      <form
        id='client-form'
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className='max-w-md mx-auto mt-5 space-y-6'
      >
        <FieldSet>
          <FieldGroup>
            <form.Field
              name='nombre'
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldDescription>Nombre del cliente</FieldDescription>
                  {field.state.meta.errors[0] && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )}
            />

            <form.Field
              name='telefono'
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldDescription>Teléfono de contacto</FieldDescription>
                  {field.state.meta.errors[0] && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )}
            />

            <form.Field
              name='correo'
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Correo</FieldLabel>
                  <Input
                    id={field.name}
                    type='email'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldDescription>Correo electrónico</FieldDescription>
                  {field.state.meta.errors[0] && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )}
            />

            <form.Field
              name='direccion'
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Dirección</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldDescription>Dirección del cliente</FieldDescription>
                  {field.state.meta.errors[0] && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )}
            />

            <form.Field
              name='rfc'
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>RFC</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldDescription>RFC del cliente</FieldDescription>
                  {field.state.meta.errors[0] && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )}
            />

            <form.Field
              name='cliente_especial'
              children={(field) => (
                <div className='flex items-center space-x-2'>
                  <FieldLabel>Cliente especial</FieldLabel>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </div>
              )}
            />

            <form.Field
              name='descuentos'
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Descuentos</FieldLabel>
                  <Input
                    id={field.name}
                    disabled={!form.getFieldValue('cliente_especial').valueOf()}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldDescription>Porcentaje de descuento, si aplica</FieldDescription>
                  {field.state.meta.errors[0] && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <Button
          type='submit'
          form='client-form'
          className='w-full mt-4 bg-green-600 hover:bg-green-700 text-white'
          disabled={loading || !form.state.canSubmit}
        >
          {loading ? <Spinner /> : 'Registrar cliente'}
        </Button>
      </form>
    </>
  );
}
