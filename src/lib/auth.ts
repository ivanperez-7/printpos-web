import { authActions, authStore } from '@/stores/authStore';
import { redirect } from '@tanstack/react-router';

const authGuard = async () => {
  const { accessToken } = authStore.state;

  const res = await fetch('http://localhost:8000/api/v1/system/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });
  if (res.status === 401) {
    // Intenta un silent refresh
    const refreshRes = await fetch('http://localhost:8000/api/v1/token/refresh/', {
      method: 'POST',
      credentials: 'include',
    });
    if (!refreshRes.ok)
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
        mask: { to: '/login', search: { redirect: undefined } },
      });
    else {
      const data = await refreshRes.json();
      authActions.setAccessToken(data.access);
    }
  }
};

export { authGuard };
