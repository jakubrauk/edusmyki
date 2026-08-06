import type { StrapiApp } from '@strapi/strapi/admin';
import { Feather } from '@strapi/icons';

export default {
  register(app: StrapiApp) {
    app.widgets.register({
      icon: Feather,
      title: { id: 'widget.monthly-revenue.title', defaultMessage: 'Miesięczny przychód' },
      component: async () => {
        const component = await import('./components/MonthlyRevenueWidget');
        return component.default;
      },
      id: 'monthly-revenue',
    });
  },
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
