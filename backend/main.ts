import * as fs from 'node:fs/promises';
import express from 'express';
import cors from 'cors';
import { router } from './src/api/router.ts';
import { scheduleUptimeChecks } from './src/scheduler.ts';
import * as sites from './src/usecases/sites/index.ts';
import { SITES_DIR } from './src/shared/paths.ts';
import { listUsers, listDomains } from './src/core/sites/storage.ts';

await fs.mkdir(SITES_DIR, { recursive: true });

const users = await listUsers();
for (const user of users) {
  const domains = await listDomains(user);
  for (const domain of domains) {
    await sites.loadAnalytics(user, domain);
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
      await sites.saveAnalytics(user, domain);
    }
  }
  process.exit(0);
});
