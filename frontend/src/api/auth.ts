import { api, setAccessToken } from './client';
import type { AuthResponse, User } from '../types';

function unwrapAuth(response: AuthResponse): { user: User; accessToken: string } {
  const user = response.data?.user ?? response.user;
  const accessToken = response.data?.accessToken ?? response.accessToken;
  if (!user || !accessToken) throw new Error(response.message ?? 'Unexpected authentication response');
  return { user, accessToken };
}

export const authApi = {
  async login(email: string, password: string) {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    const result = unwrapAuth(response.data);
    setAccessToken(result.accessToken);
    return result;
  },
  async register(name: string, email: string, password: string) {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
    const result = unwrapAuth(response.data);
    setAccessToken(result.accessToken);
    return result;
  },
  async refresh() {
    const response = await api.post('/auth/refresh', {});
    const token = response.data?.data?.accessToken as string | undefined;
    setAccessToken(token ?? null);
    return token ?? null;
  },
  async logout() {
    try { await api.post('/auth/logout', {}); }
    finally { setAccessToken(null); }
  },
};
