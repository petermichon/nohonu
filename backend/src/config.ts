export const SITES_DIR = process.env['SITES_DIR'] ?? `${import.meta.dirname}/../data`;
export const SUBDOMAIN_BASE = process.env['SUBDOMAIN_BASE'] ?? 'localhost:8080';
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const SLOT_MS = 60 * 1000;
export const SERVER_PASSWORD = process.env['SERVER_PASSWORD'];
export const DATABASE_URL = process.env['DATABASE_URL'] ?? 'file:./data/nohonu.db';
export const COMMIT_SHA = process.env['COMMIT_SHA'] ?? 'dev';
export const STARTED_AT = Date.now();
