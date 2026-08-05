import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { DATABASE_URL } from './config.ts';

type PrismaClientOptions = { adapter: PrismaLibSql };

const adapter = new PrismaLibSql({ url: DATABASE_URL });

export const db = new PrismaClient({ adapter } as PrismaClientOptions);
