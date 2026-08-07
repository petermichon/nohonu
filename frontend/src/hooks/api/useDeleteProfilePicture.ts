import { useApi } from './useApi.ts';

export function useDeleteProfilePicture() {
  const { apiFetch } = useApi();

  const deleteProfilePicture = async () => {
    const res = await apiFetch('/auth/profile-picture/delete', {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete profile picture');
    }
  };

  return { deleteProfilePicture };
}
