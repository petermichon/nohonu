import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

const TEMP_BASE = await fs.mkdtemp(path.join(os.tmpdir(), 'nohonu_test_'));
const TEST_DB = path.join(TEMP_BASE, 'test.db');
process.env['SITES_DIR'] = TEMP_BASE;
process.env['DATABASE_URL'] = `file:${TEST_DB}`;

// Push schema to test database
import { execSync } from 'node:child_process';
const backendDir = path.resolve(import.meta.dirname ?? process.cwd(), '../../..');
execSync(`npx prisma db push --accept-data-loss --schema="${backendDir}/prisma/schema.prisma"`, { cwd: backendDir, stdio: 'pipe', env: { ...process.env, DATABASE_URL: `file:${TEST_DB}`, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'yes' } });

const storageModule = await import('./storage.ts');
const extractFiles = storageModule.extractFiles;
const writeSiteMetadata = storageModule.writeSiteMetadata;
const DEFAULT_DATA = storageModule.DEFAULT_DATA;

import { db } from '../../db.ts';

async function readExtracted(user: string, domain: string, filePath: string): Promise<string | undefined> {
  const fullPath = `${TEMP_BASE}/${user}/${domain}/extracted/${filePath}`;
  try {
    return await fs.readFile(fullPath, 'utf-8');
  } catch {
    return undefined;
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function createUser(username: string): Promise<void> {
  await db.user.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash: '', displayName: username, createdAt: Date.now() },
  });
}

async function setupDomain(user: string, domain: string): Promise<void> {
  const domainDir = `${TEMP_BASE}/${user}/${domain}`;
  await fs.mkdir(domainDir, { recursive: true });
  await createUser(user);
  await writeSiteMetadata(user, domain, DEFAULT_DATA);
}

async function cleanupDomain(user: string, domain: string): Promise<void> {
  const domainDir = `${TEMP_BASE}/${user}/${domain}`;
  try {
    await fs.rm(domainDir, { recursive: true, force: true });
  } catch {
    // cleanup failure ignored
  }
}

describe('extractFiles', () => {
  it('writes normal files', async () => {
    const user = 'test-user';
    const domain = 'test-normal';
    await setupDomain(user, domain);
    try {
      const files: Record<string, Uint8Array> = {
        'index.html': new TextEncoder().encode('<h1>ok</h1>'),
        'style.css': new TextEncoder().encode('body{}'),
      };
      await extractFiles(user, domain, files);
      const html = await readExtracted(user, domain, 'index.html');
      expect(html).toBe('<h1>ok</h1>');
      const css = await readExtracted(user, domain, 'style.css');
      expect(css).toBe('body{}');
    } finally {
      await cleanupDomain(user, domain);
    }
  });

  it('skips path traversal entries (plan 001 regression)', async () => {
    const user = 'test-user';
    const domain = 'test-traversal';
    await setupDomain(user, domain);
    try {
      const files: Record<string, Uint8Array> = {
        'index.html': new TextEncoder().encode('<h1>ok</h1>'),
        '../../evil.txt': new TextEncoder().encode('pwned'),
        '/abs.txt': new TextEncoder().encode('abs'),
      };
      await extractFiles(user, domain, files);
      const html = await readExtracted(user, domain, 'index.html');
      expect(html).toBe('<h1>ok</h1>');
      const evilExists = await pathExists(`${TEMP_BASE}/evil.txt`);
      expect(evilExists).toBe(false);
      const absExists = await pathExists(`${TEMP_BASE}/abs.txt`);
      expect(absExists).toBe(false);
    } finally {
      await cleanupDomain(user, domain);
    }
  });

  it('strips common root prefix', async () => {
    const user = 'test-user';
    const domain = 'test-root';
    await setupDomain(user, domain);
    try {
      const files: Record<string, Uint8Array> = {
        'repo-main/index.html': new TextEncoder().encode('<h1>stripped</h1>'),
        'repo-main/js/app.js': new TextEncoder().encode('console.log(1)'),
      };
      await extractFiles(user, domain, files);
      const html = await readExtracted(user, domain, 'index.html');
      expect(html).toBe('<h1>stripped</h1>');
      const js = await readExtracted(user, domain, 'js/app.js');
      expect(js).toBe('console.log(1)');
    } finally {
      await cleanupDomain(user, domain);
    }
  });
});
