import type { Core } from '@strapi/strapi';

// On Railway: DATABASE_URL is automatically injected from the PostgreSQL plugin
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL'),
      ssl: {
        rejectUnauthorized: false, // Required for Railway PostgreSQL
      },
    } as any,
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
    },
  } as any,
});

export default config;
