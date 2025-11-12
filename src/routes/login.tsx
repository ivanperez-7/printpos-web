import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { PackageOpen } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import * as z from 'zod';

import { API_BASE, ENDPOINTS } from '@/api/endpoints';
import { useTheme } from '@/components/theme-provider';
import { authActions } from '@/stores/authStore';

export const loginSchema = z.object({
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
  const { theme } = useTheme();
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

      axios
        .post(ENDPOINTS.auth.login, value, { baseURL: API_BASE, withCredentials: true })
        .then((res) => res.data)
        .then(({ access, username, email, avatar }) => {
          authActions.setAccessToken(access);
          localStorage.setItem('username', username);
          localStorage.setItem('email', email);
          localStorage.setItem('avatar', avatar);

          if (redirect) router.history.push(redirect);
          else router.navigate({ to: '/dashboard' });
        })
        .catch((error) => toast.error(error.response ? error.response.data.detail : error.message))
        .finally(() => setLoading(false));
    },
  });

  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col gap-6'>
          <form
            id='login-form'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldSet>
              <FieldGroup>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <a className='flex flex-col items-center gap-2 font-medium'>
                    <div className='flex size-8 items-center justify-center rounded-md'>
                      <PackageOpen className='size-6' />
                    </div>
                  </a>
                  <h1 className='text-xl font-bold'>Bienvenido de vuelta</h1>
                  <FieldDescription>
                    ¿Aún no tiene acceso? <a href='#'>Regístrese.</a>
                  </FieldDescription>
                </div>

                <form.Field
                  name='username'
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Usuario</FieldLabel>
                      <Input
                        tabIndex={1}
                        id={field.name}
                        type='text'
                        placeholder='tu_usuario'
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </Field>
                  )}
                />

                <form.Field
                  name='password'
                  children={(field) => (
                    <Field>
                      <div className='flex items-center'>
                        <FieldLabel htmlFor='password'>Contraseña</FieldLabel>
                        <a href='#' className='ml-auto text-sm underline-offset-2 hover:underline'>
                          ¿Olvidó su contraseña?
                        </a>
                      </div>
                      <Input
                        tabIndex={2}
                        id={field.name}
                        type='password'
                        placeholder='********'
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </Field>
                  )}
                />
                <Field>
                  <Button
                    tabIndex={3}
                    type='submit'
                    form='login-form'
                    disabled={loading || !form.state.canSubmit}
                  >
                    Iniciar sesión {loading && <Spinner />}
                  </Button>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>
      </div>
      <Toaster position='top-center' richColors closeButton theme={theme} />
    </div>
  );
}
