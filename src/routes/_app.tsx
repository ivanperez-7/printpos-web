import { useStore } from '@tanstack/react-store';
import { Link, Outlet, createFileRoute, useRouter } from '@tanstack/react-router';

import { useTheme } from '@/components/theme-provider';
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Toaster } from '@/components/ui/sonner';
import { authActions, authStore } from '@/stores/authStore';
import { CustomLink } from '@/components/custom-link';
import { ENDPOINTS } from '@/api/endpoints';
import { authGuard } from '@/lib/auth';

const navbarPages = [
  {
    route: '/catalogo',
    text: 'Nuestros productos',
  },
  {
    route: '/profile',
    text: 'Check my profile',
  },
  {
    route: '/profile',
    text: 'Check my profile with params',
    search: {
      name: 'damn',
      is_active: true,
      categories: ['S', 'G'],
    },
  },
  {
    route: '/clients',
    text: 'Query clients',
  },
  {
    route: '/settings',
    text: 'My settings',
  },
  {
    route: '/dashboard',
    text: 'Dashboard',
  },
];

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => await authGuard(),
  component: RouteComponent,
});

function RouteComponent() {
  const isAuthenticated = useStore(authStore, (s) => s.accessToken);
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <>
      <h1 className='text-3xl'>Printcopy tienda web</h1>
      <nav className='flex gap-5'>
        <ButtonGroup>
          {navbarPages.map((page, index) => (
            <CustomLink key={index} to={page.route} content={page.text} />
          ))}
        </ButtonGroup>
        {isAuthenticated ? (
          <Button
            variant='outline'
            onClick={async () => {
              await fetch(ENDPOINTS.auth.logout, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${authStore.state.accessToken}`,
                },
                credentials: 'include',
              });
              authActions.clear();
              router.navigate({ to: '/login' });
            }}
          >
            Logout
          </Button>
        ) : (
          <Button asChild variant='outline'>
            <Link to='/login'>Login</Link>
          </Button>
        )}

        <ModeToggle />
      </nav>

      <Outlet />
      <Toaster position='top-center' richColors closeButton theme={theme} />
    </>
  );
}
