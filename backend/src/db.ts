import { PrismaClient } from '../generated/prisma/client.ts';
import { adapter } from './db/adapter.ts';
import type { PrismaClientOptions } from './shared/prisma/prisma-client-options.ts';

export const db = new PrismaClient({ adapter } as PrismaClientOptions);
