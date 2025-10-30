import { Outlet, createFileRoute, useRouter } from '@tanstack/react-router';

import { ENDPOINTS } from '@/api/endpoints';
import { AppSidebar } from '@/components/app-sidebar';
import { useTheme } from '@/components/theme-provider';
import { ModeToggle } from '@/components/theme-toggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { authGuard, withAuth } from '@/lib/auth';
import { authActions } from '@/stores/authStore';
import { toast } from 'sonner';

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
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden md:block'>
                <BreadcrumbLink href='#'>Building Your Application</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden md:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ModeToggle />
        </header>
        <div className='p-4'><Outlet /></div>

        <Toaster position='top-center' richColors closeButton theme={theme} />
      </SidebarInset>
    </SidebarProvider>
  );
}
