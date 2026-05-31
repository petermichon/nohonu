import { SITES_DIR } from '../../shared/paths.ts';

export async function probeStorage(): Promise<'ok' | 'error'> {
  const probe = `${SITES_DIR}/.health`;
  try {
    await Deno.writeTextFile(probe, '1');
    await Deno.readTextFile(probe);
    await Deno.remove(probe);
    return 'ok';
  } catch {
    return 'error';
  }
}
