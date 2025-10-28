import { authGuard } from '@/lib/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_private')({
  beforeLoad: async () => await authGuard(),
  component: () => <Outlet />,
});
