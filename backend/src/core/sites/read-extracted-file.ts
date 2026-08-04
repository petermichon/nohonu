import { extractedFilePath } from '../../shared/paths.ts';

import * as fs from 'node:fs/promises';


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
