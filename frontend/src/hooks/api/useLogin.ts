import { useMutation } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';
import { useConnection } from '../useConnection.ts';

interface LoginResult {
  session: string;
  user: { username: string };
}

export function useLogin() {
  const { apiFetch } = useApiFetch();
  const { setSessionId, setUsername } = useConnection();

  const mutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      return (await res.json()) as LoginResult;
    },
    onSuccess: (data) => {
      setSessionId(data.session);
      setUsername(data.user.username);
    },
  });

  return {
    login: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
