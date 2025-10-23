import { redirect } from '@tanstack/react-router';

const authGuard = async () => {
  const res = await fetch('http://localhost:8000/api/v1/system/me', {
    credentials: 'include',
  });
  if (res.status === 401) {
    // Intenta un silent refresh
    const refreshRes = await fetch('http://localhost:8000/api/v1/token/refresh/', {
      method: 'POST',
      credentials: 'include',
    });
    if (!refreshRes.ok) throw redirect({ to: '/' });
  }
};

export { authGuard };
