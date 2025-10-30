import { API_BASE, ENDPOINTS } from '@/api/endpoints';
import { authActions, authStore } from '@/stores/authStore';
import { redirect } from '@tanstack/react-router';
import axios from 'axios';

function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload));
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

const tryRefresh = async (): Promise<boolean> =>
  axios
    .post(ENDPOINTS.auth.refresh, undefined, { baseURL: API_BASE, withCredentials: true })
    .then((res) => {
      if (res.status !== 200) return false;
      return res.data;
    })
    .then(({ access }) => {
      if (access) {
        authActions.setAccessToken(access);
        return true;
      }
      return false;
    })
    .catch(() => false);

export async function authGuard() {
  const token = authStore.state.accessToken;

  if (token && !isTokenExpired(token)) return;

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

export async function authGuardSilent() {
  const token = authStore.state.accessToken;
  if (token && !isTokenExpired(token)) return true;

  const refreshed = await tryRefresh();
  return !!refreshed;
}

export const withAuth = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

withAuth.interceptors.request.use((config) => {
  const token = authStore.state.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
