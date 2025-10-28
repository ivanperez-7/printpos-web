import { ENDPOINTS } from '@/api/endpoints';
import { authActions, authStore } from '@/stores/authStore';
import { redirect } from '@tanstack/react-router';

function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload));
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINTS.auth.refresh, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.access) {
      authActions.setAccessToken(data.access);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function authGuard() {
  const token = authStore.state.accessToken;

  if (token && !isTokenExpired(token)) return; // all good, continue

  // If token expired or missing, try to refresh
  const refreshed = await tryRefresh();
  if (refreshed) return;

  // If refresh failed, force logout
  authActions.clear();
  throw redirect({
    to: '/login',
    search: { redirect: location.href },
    mask: { to: '/login', search: { redirect: undefined } },
  });
}
