/**
 * Postgres URL for a service's own database: shared DB_* settings plus the
 * database name stored in `dbEnvKey` (e.g. `USER_DB` -> user_db).
 *
 * Kept free of Nest/alias imports so prisma.config.ts files can import it too.
 */
export function databaseUrl(dbEnvKey: string, env: NodeJS.ProcessEnv = process.env): string {
  const database = env[dbEnvKey];
  if (!database) throw new Error(`Missing env ${dbEnvKey}`);

  const user = encodeURIComponent(env.DB_USER ?? '');
  const password = encodeURIComponent(env.DB_PASSWORD ?? '');
  const host = env.DB_HOST ?? 'localhost';
  const port = env.DB_PORT ?? '5432';
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}
