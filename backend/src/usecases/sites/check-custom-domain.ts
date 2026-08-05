import { customDomain as customDomainTable } from '../../db/custom-domain.ts';

export async function checkCustomDomain(customDomain: string): Promise<boolean> {
  const record = await customDomainTable.findFirst({ where: { domain: customDomain, verified: true }, select: { id: true } });
  return record !== null;
}
