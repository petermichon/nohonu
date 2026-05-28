import { handler } from './src/api/router.ts';
import { scheduleUptimeChecks } from './src/services/scheduler.ts';
import { SITES_DIR } from './src/shared/paths.ts';

await Deno.mkdir(SITES_DIR, { recursive: true });

scheduleUptimeChecks();

const port = parseInt(Deno.env.get('PORT') ?? '8080');
Deno.serve({ port }, handler);
