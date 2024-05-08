import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Grid, Button, Card, CardHeader, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { formatAmount, getPreviousMonday, getMonthName } from '../../utils';
import ReactApexChart from 'react-apexcharts';
import AddIcon from '@mui/icons-material/Add';

const Home = () => {
  const { userData,dollarRate } = useStore(); // Obtener estados del store

  const currentDate = new Date();
  const currrentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  return (
    <Layout title="Inicio">
      <Grid container item xs={12} spacing={3}>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(dollarRate['venta'])}
              subheader='Valor USD'
            />
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(userData.uber.pending)}
              subheader='Pendiente de Uber'
            />
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(userData.finances.incomes[currrentYear].months[currentMonth].total)}
              subheader={`Ganancias de ${getMonthName(currentMonth)}`}
            />
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(userData.finances.expenses[currrentYear].months[currentMonth].total)}
              subheader={`Gastos de ${getMonthName(currentMonth)}`}
            />
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(userData.finances.incomes[currrentYear].months[currentMonth].total-userData.finances.expenses[currrentYear].months[currentMonth].total)}
              subheader={`Balance de ${getMonthName(currentMonth)}`}
            />
          </Card>
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={3} justifyContent='center'>
        <Grid item>
          <Link to="/NuevoGasto">
            <Button variant='contained'>AÑADIR GASTO</Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/NuevoIngreso">
            <Button variant='contained'>AÑADIR INGRESO</Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/FinalizarJornada">
            <Button variant='contained'>FINALIZAR JORNADA UBER</Button>
          </Link>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Home;
