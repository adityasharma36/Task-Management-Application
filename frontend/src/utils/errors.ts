import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
    if (error.code === 'ERR_NETWORK') return 'Cannot connect to the server. Check that your backend is running.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
