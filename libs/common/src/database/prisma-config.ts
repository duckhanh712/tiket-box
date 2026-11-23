import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';
import { databaseUrl } from './database-url';

// The Prisma CLI does not load .env by itself.
if (existsSync('.env')) process.loadEnvFile('.env');

/**
 * Prisma CLI config shared by every apps/<service>/prisma.config.ts.
 * CLI-only: not exported from the library index, so it never reaches app bundles.
 */
export const servicePrismaConfig = (dbEnvKey: string) =>
  defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: { path: 'prisma/migrations' },
    // `prisma generate` needs no database, so a missing env must not break it (e.g. on install).
    datasource: { url: process.env[dbEnvKey] ? databaseUrl(dbEnvKey) : '' },
  });
