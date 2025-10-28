import { useForm } from '@tanstack/react-form';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

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
import { authActions } from '@/stores/authStore';
import { ENDPOINTS } from '@/api/endpoints';

const loginSchema = z.object({
  username: z
    .string()
    .min(4, 'Username must be at least 4 characters.')
    .max(32, 'Username must be at most 32 characters.'),
  password: z.string().min(3, 'Password must be at least 3 characters.'),
});

export const Route = createFileRoute('/login')({
  validateSearch: ({
    redirect,
  }): {
    redirect?: string;
  } => ({
    redirect: redirect as string,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [loading, setLoading] = useState(false);
  const { redirect } = Route.useSearch();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading) return;
      setLoading(true);

      try {
        const res = await fetch(ENDPOINTS.auth.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(value),
        });

        if (!res.ok) {
          toast.error('No se pudo iniciar sesión. Verifica tus credenciales.');
          return;
        }

        const data = await res.json();
        authActions.setAccessToken(data.access);

        if (redirect) router.history.push(redirect);
        else router.navigate({ to: '/' });
      } catch {
        toast.error('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <div className='w-full max-w-md mx-auto mt-10'>
        <form
          id='login-form'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldGroup>
              <form.Field
                name='username'
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      type='text'
                      placeholder='tu_usuario'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldDescription>Debe tener entre 5 y 32 caracteres.</FieldDescription>
                    {field.state.meta.errors[0] && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )}
              />

              <form.Field
                name='password'
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      type='password'
                      placeholder='********'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldDescription>Debe tener al menos 8 caracteres.</FieldDescription>
                    {field.state.meta.errors[0] && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <Button
            type='submit'
            form='login-form'
            className='w-full mt-4 bg-green-600 hover:bg-green-700 dark:text-white'
            disabled={loading || !form.state.canSubmit}
          >
            {loading ? <Spinner /> : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </>
  );
}
