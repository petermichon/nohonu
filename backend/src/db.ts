import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';

type PrismaClientOptions = { adapter: PrismaLibSql };

const adapter = new PrismaLibSql({
  url: process.env['DATABASE_URL'] ?? 'file:./data/nohonu.db',
});

export const db = new PrismaClient({ adapter } as PrismaClientOptions);
