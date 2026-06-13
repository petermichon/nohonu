import { assertEquals } from 'jsr:@std/assert@^1.0.0';

// Set SITES_DIR to a temp directory before importing storage.ts
const TEMP_BASE = await Deno.makeTempDir({ prefix: 'nohonu_test_' });
Deno.env.set('SITES_DIR', TEMP_BASE);

// Dynamic import after setting env var
const storageModule = await import('./storage.ts');
const extractFiles = storageModule.extractFiles;
const writeSiteMetadata = storageModule.writeSiteMetadata;
const DEFAULT_DATA = storageModule.DEFAULT_DATA;

async function readExtracted(domain: string, filePath: string): Promise<string | undefined> {
  const fullPath = `${TEMP_BASE}/${domain}/extracted/${filePath}`;
  try {
    return await Deno.readTextFile(fullPath);
  } catch {
    return undefined;
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await Deno.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function setupDomain(domain: string): Promise<void> {
  const domainDir = `${TEMP_BASE}/${domain}`;
  await Deno.mkdir(domainDir, { recursive: true });
  await writeSiteMetadata(domain, DEFAULT_DATA);
}

async function cleanupDomain(domain: string): Promise<void> {
  const domainDir = `${TEMP_BASE}/${domain}`;
  try {
    await Deno.remove(domainDir, { recursive: true });
  } catch {
    // Ignore cleanup errors
  }
}

Deno.test('extractFiles: writes normal files', async () => {
  const domain = 'test-normal';
  await setupDomain(domain);
  try {
    const files: Record<string, Uint8Array> = {
      'index.html': new TextEncoder().encode('<h1>ok</h1>'),
      'style.css': new TextEncoder().encode('body{}'),
    };
    await extractFiles(domain, files);
    const html = await readExtracted(domain, 'index.html');
    assertEquals(html, '<h1>ok</h1>');
    const css = await readExtracted(domain, 'style.css');
    assertEquals(css, 'body{}');
  } finally {
    await cleanupDomain(domain);
  }
});

Deno.test('extractFiles: skips path traversal entries (plan 001 regression)', async () => {
  const domain = 'test-traversal';
  await setupDomain(domain);
  try {
    const files: Record<string, Uint8Array> = {
      'index.html': new TextEncoder().encode('<h1>ok</h1>'),
      '../../evil.txt': new TextEncoder().encode('pwned'),
      '/abs.txt': new TextEncoder().encode('abs'),
    };
    await extractFiles(domain, files);
    const html = await readExtracted(domain, 'index.html');
    assertEquals(html, '<h1>ok</h1>');
    const evilExists = await pathExists(`${TEMP_BASE}/evil.txt`);
    assertEquals(evilExists, false);
    const absExists = await pathExists(`${TEMP_BASE}/abs.txt`);
    assertEquals(absExists, false);
  } finally {
    await cleanupDomain(domain);
  }
});

Deno.test('extractFiles: strips common root prefix', async () => {
  const domain = 'test-root';
  await setupDomain(domain);
  try {
    const files: Record<string, Uint8Array> = {
      'repo-main/index.html': new TextEncoder().encode('<h1>stripped</h1>'),
      'repo-main/js/app.js': new TextEncoder().encode('console.log(1)'),
    };
    await extractFiles(domain, files);
    const html = await readExtracted(domain, 'index.html');
    assertEquals(html, '<h1>stripped</h1>');
    const js = await readExtracted(domain, 'js/app.js');
    assertEquals(js, 'console.log(1)');
  } finally {
    await cleanupDomain(domain);
  }
});
