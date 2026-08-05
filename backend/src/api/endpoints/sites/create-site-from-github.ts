import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { createSiteFromGithub as createSiteFromGithubUsecase } from '../../../usecases/sites/create-site-from-github.ts';
import { extractCreateGithubParams } from '../../../shared/express/extract-create-github-params.ts';

export async function createSiteFromGithub(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractCreateGithubParams(req);
  if (!params) {
    json(res, { error: 'Invalid repo format. Use owner/repo' }, 400);
    return;
  }

  const result = await createSiteFromGithubUsecase(
    params.sessionId,
    params.domain,
    params.repo,
    params.ref,
    params.subdomain,
  );
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  const value = result.value;
  json(res, { domain: params.domain, index: value.index, repo: value.repo, branch: value.branch }, 201);
}
