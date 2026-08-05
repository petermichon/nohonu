import { GITHUB_REPO_REGEX } from '../../../shared/github-repo-regex.ts';

export function validateRepo(repo: unknown): repo is string {
  return typeof repo === 'string' && GITHUB_REPO_REGEX.test(repo);
}
