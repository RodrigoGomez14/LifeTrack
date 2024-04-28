import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Grid, Typography, Card, CardHeader, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { formatAmount, getPreviousMonday, getMonthName } from '../../utils';
import ReactApexChart from 'react-apexcharts';
import AddIcon from '@mui/icons-material/Add';

const Home = () => {
  const { userData, dollarRate } = useStore();
  const currentDate = new Date();
  const currentMonth = `0${currentDate.getMonth() + 1}`;
  const currentYear = currentDate.getFullYear();

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalUberPending, setTotalUberPending] = useState(0);
  const [totalUberEarnings, setTotalUberEarnings] = useState(0);

  useEffect(() => {
    // Calcular el total de ingresos y gastos
    let incomeTotal = 0;
    let expenseTotal = 0;
    let uberPending = userData.uber.pending || 0;
    let uberEarnings = 0;

    if (userData.incomes[currentYear]) {
      Object.keys(userData.incomes[currentYear].data).forEach((month) => {
        incomeTotal += userData.incomes[currentYear].data[month].total || 0;
      });
    }

    if (userData.expenses[currentYear]) {
      Object.keys(userData.expenses[currentYear].data).forEach((month) => {
        expenseTotal += userData.expenses[currentYear].data[month].total || 0;
      });
    }

    if (userData.uber.data[currentYear] && userData.uber.data[currentYear].data[currentMonth]) {
      Object.keys(userData.uber.data[currentYear].data[currentMonth].data).forEach((transactionId) => {
        const transaction = userData.uber.data[currentYear].data[currentMonth].data[transactionId];
        uberEarnings += transaction.amount;
      });
    }

    setTotalIncome(incomeTotal);
    setTotalExpenses(expenseTotal);
    setTotalUberPending(uberPending);
    setTotalUberEarnings(uberEarnings);
  }, [userData]);

  // Opciones para gráficos de línea para ingresos y gastos mensuales
  const seriesMonthly = [];
  const labelsMonthly = [];

  if (userData.incomes[currentYear]) {
    Object.keys(userData.incomes[currentYear].data).forEach((month) => {
      const income = userData.incomes[currentYear].data[month].total || 0;
      const expense = userData.expenses[currentYear].data[month].total || 0;
      seriesMonthly.push({
        x: getMonthName(month),
        y: income - expense,
      });
      labelsMonthly.push(getMonthName(month));
    });
  }

  const optionsMonthly = {
    chart: {
      id: 'monthly-balance-chart',
    },
    xaxis: {
      categories: labelsMonthly,
    },
    tooltip: {
      y: {
        formatter: (val) => formatAmount(val),
      },
    },
  };

  return (
    <Layout title="Inicio">
      <Grid container spacing={3} justifyContent="center">
        {/* Tarjetas con estadísticas relevantes */}
        <Grid item xs={12} sm={3}>
          <Card>
            <CardHeader
              title="Ingresos Totales"
              subheader={formatAmount(totalIncome)}
            />
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardHeader
              title="Gastos Totales"
              subheader={formatAmount(totalExpenses)}
            />
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardHeader
              title="Uber Pendiente"
              subheader={formatAmount(totalUberPending)}
            />
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardHeader
              title="Uber Ganancias"
              subheader={formatAmount(totalUberEarnings)}
            />
          </Card>
        </Grid>

        {/* Gráficos relevantes */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" align="center">
            Balance Mensual
          </Typography>
          <ReactApexChart
            options={optionsMonthly}
            series={[{ name: 'Balance', data: seriesMonthly }]}
            type="line"
            height={300}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" align="center">
            Evolución de Ingresos y Gastos
          </Typography>
          <ReactApexChart
            options={optionsMonthly}
            series={[{ name: 'Ingresos - Gastos', data: seriesMonthly }]}
            type="bar"
            height={300}
          />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Home;
