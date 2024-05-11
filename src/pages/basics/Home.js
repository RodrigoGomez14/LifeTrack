import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Grid, Button, Card, CardHeader, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { formatAmount, getPreviousMonday, getMonthName } from '../../utils';
import ReactApexChart from 'react-apexcharts';
import AddIcon from '@mui/icons-material/Add';
import { YAxis } from 'recharts';
import { formatters } from 'date-fns';

const Home = () => {
  const { userData,dollarRate } = useStore(); // Obtener estados del store

  const currentDate = new Date();
  const currrentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const seriesLineChart = [];
  const secondSeriesLineChart = [];
  const thirdSeriesLineChart = [];
  const labelsChart = [];

  Object.keys(userData.finances.incomes[currrentYear].months).map(i=>{
    seriesLineChart.push(userData.finances.incomes[currrentYear].months[i].total)
    thirdSeriesLineChart.push(userData.finances.incomes[currrentYear].months[i].total)
    labelsChart.push(getMonthName(i))
  })
  Object.keys(userData.finances.expenses[currrentYear].months).map(i=>{
    console.log(thirdSeriesLineChart[i-1])
    thirdSeriesLineChart[i-1]=(thirdSeriesLineChart[i-1]-userData.finances.expenses[currrentYear].months[i].total)
    secondSeriesLineChart.push(userData.finances.expenses[currrentYear].months[i].total)
  })

  const optionsChart = {
    labels:labelsChart,
    tooltip:{
        y:{
            formatter: val=> formatAmount(val)
        }
    },
    markers:{
        size:3
    },
    stroke:{
        curve: 'smooth',
    },
    yaxis:{
      labels:{
        formatter:(val)=> formatAmount(val)
      }
    }
  };

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
      <Grid container item xs={12} spacing={3} justifyContent='center'>
        <ReactApexChart
            options={optionsChart}
            series={[{type:'line',data: seriesLineChart,name:'Ingresos'},{type:'line',data: secondSeriesLineChart,name:'Gastos'},{type:'area',data: thirdSeriesLineChart,name:'Balance'}]}
            type="line"
            height={300}
            width={1000}
        />
      </Grid>
    </Layout>
  );
};

export default Home;
