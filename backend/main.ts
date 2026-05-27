import { handler } from './src/api/router.ts';
import { scheduleUptimeChecks } from './src/services/scheduler.ts';

scheduleUptimeChecks();

const port = parseInt(Deno.env.get('PORT') ?? '8080');
Deno.serve({ port }, handler);
