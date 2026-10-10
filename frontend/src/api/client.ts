import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL =  import.meta.env.VITE_API_URL ||  'http://localhost:3002/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = original?.url ?? '';
    const isAuthCall = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'].some((path) => url.includes(path));

    if (error.response?.status !== 401 || !original || original._retry || isAuthCall) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh', {}).then((response) => {
          const token = response.data?.data?.accessToken as string | undefined;
          setAccessToken(token ?? null);
          return token ?? null;
        }).catch(() => {
          setAccessToken(null);
          return null;
        }).finally(() => { refreshPromise = null; });
      }
      const newToken = await refreshPromise;
      if (!newToken) return Promise.reject(error);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      return Promise.reject(error);
    }
  },
);
