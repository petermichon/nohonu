import { useApi } from './useApi.ts';

export function useUploadProfilePicture() {
  const { apiFetch } = useApi();

  const uploadProfilePicture = async (file: File) => {
    const res = await apiFetch('/auth/profile-picture', {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to upload profile picture');
    }
  };

  return { uploadProfilePicture };
}
