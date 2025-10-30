import { authGuardSilent } from '@/lib/auth';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: IndexRedirect,
});

function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const logged = await authGuardSilent();
      router.navigate({ to: logged ? '/dashboard' : '/login' });
    };
    check();
  }, []);

  return null;
}
