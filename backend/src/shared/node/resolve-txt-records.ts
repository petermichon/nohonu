import * as dns from 'node:dns/promises';

export async function resolveTxtRecords(hostname: string): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(hostname);
    if (!records) return [];
    return records.flat();
  } catch (error) {
    console.error(`DNS lookup failed for ${hostname}:`, error);
    return [];
  }
}
