import type { Request as ExpressReq, Response as ExpressRes } from 'express';
import { json } from '../../../shared/express/http.ts';
import { sendUsecaseError } from '../../../shared/express/errors.ts';
import { extractGithubParams } from '../../../shared/express/extract-github-params.ts';
import { uploadVersionFromGithub } from '../../../usecases/sites/upload-version-from-github.ts';

export async function fetchGithub(req: ExpressReq, res: ExpressRes): Promise<void> {
  const params = await extractGithubParams(req);
  if (!params) {
    json(res, { error: 'Invalid repo format. Use owner/repo' }, 400);
    return;
  }

  const result = await uploadVersionFromGithub(params.sessionId, params.domain, params.repo, params.ref);
  if (!result.ok) {
    sendUsecaseError(res, result);
    return;
  }
  const value = result.value;
  json(res, { domain: params.domain, index: value.index, repo: value.repo, branch: value.branch });
}
