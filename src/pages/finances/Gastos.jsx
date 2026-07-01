import React from 'react';
import Layout from '../../components/layout/Layout';
import { FinancesPage } from './Finances';

const Gastos = () => (
  <Layout title="Gastos">
    <FinancesPage dataType="expenses" title="Gastos" />
  </Layout>
);

export default Gastos;
