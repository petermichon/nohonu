import { PrismaLibSql } from '@prisma/adapter-libsql';
import { DATABASE_URL } from '../config.ts';

export const adapter = new PrismaLibSql({ url: DATABASE_URL });
