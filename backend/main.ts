import { router } from './src/api/router.ts';
import { SITES_DIR } from './src/config.ts';
import { scheduleUptimeChecks } from './src/scheduler.ts';
import { loadAnalytics } from './src/usecases/sites/load-analytics.ts';
import { saveAnalytics } from './src/usecases/sites/save-analytics.ts';
import { site } from './src/db/site.ts';
import { user as userTable } from './src/db/user.ts';

import * as fs from 'node:fs/promises';
import express from 'express';
import cors from 'cors';

await fs.mkdir(SITES_DIR, { recursive: true });

const users = (await userTable.findMany({ select: { username: true } })).map((u) => u.username);
for (const user of users) {
  const domains = (await site.findMany({ where: { userUsername: user }, select: { siteId: true } })).map(
    (s) => s.siteId,
  );
  for (const siteId of domains) {
    await loadAnalytics(user, siteId);
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
  const siteUsers = (await userTable.findMany({ select: { username: true } })).map((u) => u.username);
  for (const user of siteUsers) {
    const domains = (await site.findMany({ where: { userUsername: user }, select: { siteId: true } })).map(
      (s) => s.siteId,
    );
    for (const siteId of domains) {
      await saveAnalytics(user, siteId);
    }
  }
  process.exit(0);
});
