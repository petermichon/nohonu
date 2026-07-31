// ponytail: PBKDF2 with SHA-256, 100k iterations - secure enough for web app, upgrade to argon2 if needed

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, ['deriveBits']);

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  );

  const hash = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);

  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0));

  const salt = combined.slice(0, 16);
  const storedHashBytes = combined.slice(16);

  const key = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, ['deriveBits']);

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  );

  const hash = new Uint8Array(derivedBits);

  if (hash.length !== storedHashBytes.length) return false;

  for (let i = 0; i < hash.length; i++) {
    if (hash[i] !== storedHashBytes[i]) return false;
  }

  return true;
}
