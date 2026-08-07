import { useMutation } from '@tanstack/react-query';
import { useApiFetch } from './useApiFetch.ts';
import { useConnection } from '../useConnection.ts';

interface SignupResult {
  session: string;
  user: { username: string };
}

export function useSignup() {
  const { apiFetch } = useApiFetch();
  const { setSessionId, setUsername } = useConnection();

  const mutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }
      return (await res.json()) as SignupResult;
    },
    onSuccess: (data) => {
      setSessionId(data.session);
      setUsername(data.user.username);
    },
  });

  return {
    signup: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
