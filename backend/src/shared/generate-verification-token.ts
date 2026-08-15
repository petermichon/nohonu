export async function generateVerificationToken(user: string, siteId: string): Promise<string> {
  const data = new TextEncoder().encode(`${user}-${siteId}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `nohonu-verify-${hashHex.substring(0, 16)}`;
}
