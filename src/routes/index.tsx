import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { authGuardSilent } from '@/lib/auth';

export const Route = createFileRoute('/')({
  component: () => {
    const router = useRouter();

    useEffect(() => {
      const check = async () => {
        const logged = await authGuardSilent();
        router.navigate({ to: logged ? '/dashboard' : '/login' });
      };
      check();
    }, []);
  },
});
