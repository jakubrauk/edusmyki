import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Partial<Core.Config.Server> => ({
  url: env('PUBLIC_URL', ''),
  proxy: true,
  app: {
    keys: env.array('APP_KEYS') as string[],
  },
});

export default config;
