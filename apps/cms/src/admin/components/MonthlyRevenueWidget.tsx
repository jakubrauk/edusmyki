import { useEffect, useState } from 'react';
import { Flex, Table, Thead, Tbody, Tr, Th, Td, Typography, Loader } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';

type MonthlyRow = {
  month: string;
  revenue: number;
  ordersCount: number;
};

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
});

const monthFormatter = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' });

const formatMonth = (month: string) => {
  const [year, monthIndex] = month.split('-').map(Number);
  return monthFormatter.format(new Date(year, monthIndex - 1, 1));
};

const MonthlyRevenueWidget = () => {
  const { get } = useFetchClient();
  const [rows, setRows] = useState<MonthlyRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    get('/orders/monthly-report')
      .then(({ data }) => setRows(data.data.slice(0, 12)))
      .catch(() => setError(true));
  }, [get]);

  if (error) {
    return (
      <Typography textColor="danger600">Nie udało się pobrać raportu zamówień.</Typography>
    );
  }

  if (!rows) {
    return (
      <Flex justifyContent="center" padding={4}>
        <Loader>Ładowanie...</Loader>
      </Flex>
    );
  }

  if (rows.length === 0) {
    return <Typography>Brak opłaconych zamówień.</Typography>;
  }

  return (
    <Table colCount={3} rowCount={rows.length + 1}>
      <Thead>
        <Tr>
          <Th>
            <Typography variant="sigma">Miesiąc</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Przychód</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Zamówienia</Typography>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <Tr key={row.month}>
            <Td>
              <Typography textTransform="capitalize">{formatMonth(row.month)}</Typography>
            </Td>
            <Td>
              <Typography fontWeight="bold">{currencyFormatter.format(row.revenue)}</Typography>
            </Td>
            <Td>
              <Typography>{row.ordersCount}</Typography>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default MonthlyRevenueWidget;
