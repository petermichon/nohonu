import { db } from '../../db.ts';


export async function checkCustomDomain(customDomain: string): Promise<boolean> {
  const record = await db.customDomain.findFirst({ where: { domain: customDomain, verified: true }, select: { id: true } });
  return record !== null;
}
