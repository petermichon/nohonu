import * as fs from 'node:fs/promises';
import express from 'express';
import cors from 'cors';
import { router } from './src/api/router.ts';
import { scheduleUptimeChecks } from './src/scheduler.ts';
import { loadAnalytics } from './src/usecases/sites/load-analytics.ts';
import { saveAnalytics } from './src/usecases/sites/save-analytics.ts';
import { SITES_DIR } from './src/config.ts';
import { listUsers, listDomains } from './src/core/sites/db.ts';

await fs.mkdir(SITES_DIR, { recursive: true });

const users = await listUsers();
for (const user of users) {
  const domains = await listDomains(user);
  for (const domain of domains) {
    await loadAnalytics(user, domain);
  }
}

scheduleUptimeChecks();

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.raw({ type: '*/*', limit: '50mb' }));

app.use(router);

const port = parseInt(process.env['PORT'] ?? '8080');
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

process.on('SIGTERM', async () => {
  server.close();
  const siteUsers = await listUsers();
  for (const user of siteUsers) {
    const domains = await listDomains(user);
    for (const domain of domains) {
      await saveAnalytics(user, domain);
    }
  }
  process.exit(0);
});
