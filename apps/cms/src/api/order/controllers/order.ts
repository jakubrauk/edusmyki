import { factories } from '@strapi/strapi';

type PaidOrder = {
  totalAmount: number;
  paidAt: string | Date;
};

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async monthlyReport(ctx) {
    const orders: PaidOrder[] = await strapi.db.query('api::order.order').findMany({
      where: { status: 'paid', paidAt: { $notNull: true } },
      select: ['totalAmount', 'paidAt'],
    });

    const byMonth = new Map<string, { revenue: number; ordersCount: number }>();

    for (const order of orders) {
      const month = new Date(order.paidAt).toISOString().slice(0, 7); // YYYY-MM
      const entry = byMonth.get(month) ?? { revenue: 0, ordersCount: 0 };
      entry.revenue += Number(order.totalAmount);
      entry.ordersCount += 1;
      byMonth.set(month, entry);
    }

    const data = Array.from(byMonth.entries())
      .map(([month, { revenue, ordersCount }]) => ({
        month,
        revenue: Math.round(revenue * 100) / 100,
        ordersCount,
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    ctx.body = { data };
  },
}));
