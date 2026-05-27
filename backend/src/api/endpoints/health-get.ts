import { json } from '../../shared/http.ts';

export function health(): Response {
  return json({ status: 'healthy' });
}
