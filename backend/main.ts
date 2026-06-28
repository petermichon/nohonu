import { handler } from './src/api/router.ts';
import { scheduleUptimeChecks } from './scheduler.ts';
import { loadAnalytics, saveAnalytics } from './src/core/analytics/metrics.ts';
import { SITES_DIR } from './src/shared/paths.ts';
import { listUsers, listDomains } from './src/core/sites/storage.ts';

await Deno.mkdir(SITES_DIR, { recursive: true });

// Load analytics for all sites
const users = await listUsers();
for (const user of users) {
  const domains = await listDomains(user);
  for (const domain of domains) {
    await loadAnalytics(user, domain);
  }
}

scheduleUptimeChecks();

const port = parseInt(Deno.env.get('PORT') ?? '8080');
const server = Deno.serve({ port }, handler);

Deno.addSignalListener('SIGTERM', async () => {
  await server.shutdown();
  // Save analytics for all sites
  const users = await listUsers();
  for (const user of users) {
    const domains = await listDomains(user);
    for (const domain of domains) {
      await saveAnalytics(user, domain);
    }
  }
});
