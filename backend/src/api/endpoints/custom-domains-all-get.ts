import { error, json } from '../../shared/http.ts';
import * as sites from '../../usecases/sites/index.ts';
import * as storage from '../../core/sites/storage.ts';

export async function getAllCustomDomains(req: Request): Promise<Response> {
  try {
    const account = req.headers.get('X-Account');
    const allCustomDomains = await sites.getAllCustomDomains();

    // Filter by account if provided
    let filteredDomains = allCustomDomains;
    if (account) {
      filteredDomains = [];
      for (const cd of allCustomDomains) {
        const siteData = await storage.readSiteMetadata(cd.siteDomain);
        if (siteData?.account === account) {
          filteredDomains.push(cd);
        }
      }
    }

    return json({ customDomains: filteredDomains });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get custom domains';
    return error(message, 500);
  }
}
