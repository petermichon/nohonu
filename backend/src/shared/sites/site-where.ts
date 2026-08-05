export function siteWhere(
  user: string,
  domain: string,
): { userUsername_domain: { userUsername: string; domain: string } } {
  return { userUsername_domain: { userUsername: user, domain } };
}
