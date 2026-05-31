import { handler } from './src/api/router.ts';
import { scheduleUptimeChecks } from './scheduler.ts';
import { loadAnalytics, saveAnalytics } from './src/core/analytics/metrics.ts';
import { SITES_DIR } from './src/shared/paths.ts';

await Deno.mkdir(SITES_DIR, { recursive: true });
await loadAnalytics();

scheduleUptimeChecks();

const port = parseInt(Deno.env.get('PORT') ?? '8080');
const server = Deno.serve({ port }, handler);

Deno.addSignalListener('SIGTERM', async () => {
  await server.shutdown();
  await saveAnalytics();
});
