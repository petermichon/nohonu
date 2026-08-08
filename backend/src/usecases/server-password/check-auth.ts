import { SERVER_PASSWORD } from '../../config.ts';

export function checkAuth(providedKey: string | null): { secured: boolean; valid: boolean } {
  if (!SERVER_PASSWORD) return { secured: false, valid: false };
  return { secured: true, valid: providedKey === SERVER_PASSWORD };
}
