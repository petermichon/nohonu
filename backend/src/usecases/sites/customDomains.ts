import * as dns from 'node:dns/promises';

async function generateVerificationToken(domain: string): Promise<string> {
  const data = new TextEncoder().encode(domain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `nohonu-verify-${hashHex.substring(0, 16)}`;
}

export async function verifyCustomDomain(domain: string, customDomain: string): Promise<boolean> {
  const expectedToken = await generateVerificationToken(domain);
  const txtRecordName = `_nohonu.${customDomain}`;
  
  try {
    const records = await dns.resolveTxt(txtRecordName);
    if (!records || records.length === 0) {
      return false;
    }
    
    for (const record of records) {
      for (const value of record) {
        if (value === expectedToken) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error(`DNS lookup failed for ${txtRecordName}:`, error);
    return false;
  }
}

export async function getVerificationToken(domain: string): Promise<string> {
  return await generateVerificationToken(domain);
}
