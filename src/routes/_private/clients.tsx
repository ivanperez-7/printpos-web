import { clientSchema, fetchAllClientes } from '@/api/clientes';
import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { getCookie } from '@/lib/utils';
import { authStore } from '@/stores/authStore';
import { ENDPOINTS } from '@/api/endpoints';

export const Route = createFileRoute('/_private/clients')({
  component: RouteComponent,
  loader: async () => await fetchAllClientes(),
});

function RouteComponent() {
  const [loading, setLoading] = useState(false);
  const clientes = Route.useLoaderData();

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

      try {
        const res = await fetch(ENDPOINTS.clients.list, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.state.accessToken}`,
            'X-CSRFToken': getCookie('csrftoken'),
          },
          credentials: 'include',
          body: JSON.stringify(value),
        });

        if (!res.ok) {
          toast.error('No se pudo crear el cliente.');
          return;
        }

        toast.success('Cliente registrado correctamente.');
        form.reset();
      } catch {
        toast.error('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div>
      <div>
        Actualmente existen {clientes.length} clientes en el sistema:
        <ul className='list-disc ml-6 text-gray-600'>
          {clientes.map((cliente) => (
            <li key={cliente.nombre}>{cliente.nombre}</li>
          ))}
        </ul>
      </div>

      <h1 className='mt-5 text-xl font-bold'>¿Registrar nuevo cliente?</h1>
      <span className='text-gray-500 text-sm'>Sin problema</span>

      <form
        id='client-form'
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className='max-w-md mx-auto mt-10 space-y-6'
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
    </div>
  );
}
