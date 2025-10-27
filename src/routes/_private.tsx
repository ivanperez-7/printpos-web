import { authGuard } from '@/lib/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_private')({
  beforeLoad: authGuard,
  component: () => <Outlet />,
});
