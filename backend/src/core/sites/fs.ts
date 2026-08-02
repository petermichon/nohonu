import * as fs from 'node:fs/promises';
import { versionPath, extractedFilePath } from './paths.ts';

export async function openVersion(user: string, domain: string, index: number): Promise<fs.FileHandle> {
  return await fs.open(versionPath(user, domain, index));
}

export async function readVersion(user: string, domain: string, index: number): Promise<Uint8Array> {
  return await fs.readFile(versionPath(user, domain, index));
}

export async function versionExists(user: string, domain: string, index: number): Promise<boolean> {
  try {
    await fs.stat(versionPath(user, domain, index));
    return true;
  } catch {
    return false;
  }
}

export async function readExtractedFile(user: string, domain: string, filePath: string): Promise<fs.FileHandle | undefined> {
  const fullPath = extractedFilePath(user, domain, filePath);
  try {
    return await fs.open(fullPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to read extracted file ${fullPath}: ${message}`);
    return undefined;
  }
}
