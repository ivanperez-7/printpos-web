import { useForm } from '@tanstack/react-form';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import axios from 'axios';
import { PackageOpen } from 'lucide-react';
import { toast, Toaster } from 'sonner';

import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

import { API_BASE, ENDPOINTS } from '@/api/endpoints';
import { authActions } from '@/stores/authStore';

export const Route = createFileRoute('/login')({
  validateSearch: ({ redirect }) => ({
    redirect: (redirect as string) || undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { theme } = useTheme();

  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center gap-2'>
            <PackageOpen className='size-6 mb-1' />
            <h1 className='text-xl font-bold'>Bienvenido de vuelta</h1>
            <FieldDescription>
              ¿Aún no tiene acceso? <a href='#'>Regístrese.</a>
            </FieldDescription>
          </div>
          <LoginForm />
        </div>
      </div>
      <Toaster position='top-center' richColors theme={theme} />
    </div>
  );
}

function LoginForm() {
  const { redirect } = Route.useSearch();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await axios.post(ENDPOINTS.auth.login, value, {
          baseURL: API_BASE,
          withCredentials: true,
        });
        const { access, username, email, avatar } = res.data;

        authActions.setAccessToken(access);
        localStorage.setItem('username', username);
        localStorage.setItem('email', email);
        localStorage.setItem('avatar', avatar);

        if (redirect) router.history.push(redirect);
        else router.navigate({ to: '/dashboard' });
      } catch (error: any) {
        toast.error(error.response ? error.response.data.detail : 'No se pudo conectar al servidor');
      }
    },
  });

  return (
    <form
      id='login-form'
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldGroup>
          <form.Field name='username'>
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Usuario</FieldLabel>
                <Input
                  tabIndex={1}
                  id={field.name}
                  type='text'
                  placeholder='usuario_07'
                  autoComplete='username'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value.toLocaleLowerCase())}
                  onBlur={field.handleBlur}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name='password'>
            {(field) => (
              <Field>
                <div className='flex items-center'>
                  <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                  <a href='#' className='ml-auto text-sm underline-offset-2 hover:underline'>
                    ¿Olvidó su contraseña?
                  </a>
                </div>
                <Input
                  tabIndex={2}
                  id={field.name}
                  type='password'
                  placeholder='********'
                  autoComplete='current-password'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </Field>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Field>
                <Button
                  tabIndex={3}
                  type='submit'
                  form='login-form'
                  disabled={isSubmitting || !form.state.canSubmit}
                >
                  {isSubmitting && <Spinner />} Iniciar sesión
                </Button>
              </Field>
            )}
          </form.Subscribe>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
