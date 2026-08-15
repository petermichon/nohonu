export function siteWhere(
  user: string,
  siteId: string,
): { userUsername_siteId: { userUsername: string; siteId: string } } {
  return { userUsername_siteId: { userUsername: user, siteId } };
}
