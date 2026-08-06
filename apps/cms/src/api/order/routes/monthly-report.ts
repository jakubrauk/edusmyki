export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/orders/monthly-report',
      handler: 'order.monthlyReport',
      config: { policies: [] },
    },
  ],
};
