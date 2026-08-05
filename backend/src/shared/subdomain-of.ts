export function subdomainOf(host: string): string | undefined {
  const match = host.match(/^([^.]+)\./);
  const subdomain = match?.[1];
  if (!subdomain || subdomain === 'www') return undefined;
  return subdomain;
}
