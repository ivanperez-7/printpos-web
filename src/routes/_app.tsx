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
import { useState } from 'react';

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => await authGuard(),
  component: RouteComponent,
});

function RouteComponent() {
  const [loadingLogout, setLoadingLogout] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const onLogout = async () => {
    if (loadingLogout) return;

    setLoadingLogout(true);
    withAuth
      .post(ENDPOINTS.auth.logout)
      .then(() => {
        authActions.clear();
        router.navigate({ to: '/login' });
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoadingLogout(false));
  };

  return (
    <SidebarProvider>
      <AppSidebar onLogout={onLogout} loadingLogout={loadingLogout} />
      <SidebarInset>
        <HeaderProvider>
          <SiteHeader />
          <div className='p-4 md:p-7'>
            <Outlet />
          </div>
        </HeaderProvider>

        <Toaster position='top-center' richColors closeButton theme={theme} />
      </SidebarInset>
    </SidebarProvider>
  );
}
