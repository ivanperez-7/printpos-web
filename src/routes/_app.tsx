import { Outlet, createFileRoute, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

import { ENDPOINTS } from '@/api/endpoints';
import { AppSidebar } from '@/components/app-sidebar';
import { HeaderProvider, SiteHeader } from '@/components/site-header';
import { useTheme } from '@/components/theme-provider';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { authGuard, withAuth } from '@/lib/auth';
import { authActions } from '@/stores/authStore';

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => await authGuard(),
  component: RouteComponent,
});

function RouteComponent() {
  const { theme } = useTheme();
  const router = useRouter();

  const onLogout = async () =>
    withAuth
      .post(ENDPOINTS.auth.logout)
      .then(() => {
        authActions.clear();
        router.navigate({ to: '/login' });
      })
      .catch((error) => toast.error(error.message));

  return (
    <SidebarProvider>
      <AppSidebar onLogout={onLogout} />
      <SidebarInset>
        <HeaderProvider>
          <SiteHeader />
          <div className='p-4'>
            <Outlet />
          </div>
        </HeaderProvider>

        <Toaster position='top-center' richColors closeButton theme={theme} />
      </SidebarInset>
    </SidebarProvider>
  );
}
