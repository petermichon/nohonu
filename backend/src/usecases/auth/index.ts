const API_KEY = process.env['API_KEY'];

export function checkAuth(providedKey: string | null): { secured: boolean; valid: boolean } {
  if (!API_KEY) return { secured: false, valid: false };
  return { secured: true, valid: providedKey === API_KEY };
}
