import React from 'react';
import Layout from '../../components/layout/Layout';
import { FinancesPage } from './Finances';

const Ingresos = () => (
  <Layout title="Ingresos">
    <FinancesPage dataType="incomes" title="Ingresos" />
  </Layout>
);

export default Ingresos;
