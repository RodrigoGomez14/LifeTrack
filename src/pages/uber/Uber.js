import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Typography, Grid, IconButton, Dialog, DialogTitle, Button } from '@mui/material';
import { formatAmount, formatMinutesToHours, getMonthName } from '../../utils';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { useStore } from '../../store';
import CardChallengeUber from '../../components/uber/CardChallengeUber';
import CardPendingUber from '../../components/uber/CardPendingUber';
import CardTotalWeeklyUber from '../../components/uber/CardTotalWeeklyUber';
import CardTotalGasExpenses from '../../components/uber/CardTotalGasExpenses';
import CardTotalMonthlyUber from '../../components/uber/CardTotalMonthlyUber';
import CardAverageDailyUber from '../../components/uber/CardAverageDailyUber';
import UberMonthList from '../../components/uber/UberMonthList';
import ReactApexChart from 'react-apexcharts';

const Uber = () => {
  const { userData } = useStore(); // Obtener estados del store
  const [showDialog, setShowDialog] = useState(false);

  const coefficientData = [];
  const earningsData = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  let totalEarnings = 0;
  const groupedUberData = {};

  // Calcular datos para gráficos limitados al mes actual
  if (userData.uber.data) {
    
    // Agrupar datos por año y por mes
    Object.keys(userData.uber.data).forEach((transactionId) => {
      const transaction = userData.uber.data[transactionId];
      const [day, month, year] = transaction.date.split('/').map(Number);
      if (!groupedUberData[year]) {
        groupedUberData[year] = { 
          total: 0,totalUSD:0,
          months: {
            1:{ total: 0,totalUSD:0, data: [] },
            2:{ total: 0,totalUSD:0, data: [] },
            3:{ total: 0,totalUSD:0, data: [] },
            4:{ total: 0,totalUSD:0, data: [] },
            5:{ total: 0,totalUSD:0, data: [] },
            6:{ total: 0,totalUSD:0, data: [] },
            7:{ total: 0,totalUSD:0, data: [] },
            8:{ total: 0,totalUSD:0, data: [] },
            9:{ total: 0,totalUSD:0, data: [] },
            10:{ total: 0,totalUSD:0, data: [] },
            11:{ total: 0,totalUSD:0, data: [] },
            12:{ total: 0,totalUSD:0, data: [] }
          }
        }
      }

      groupedUberData[year].months[month].data.push(transaction);
      groupedUberData[year].months[month].total+=transaction.amount;
      groupedUberData[year].months[month].totalUSD+=transaction.amountUSD;
      groupedUberData[year].total+=transaction.amount;
      groupedUberData[year].totalUSD+=transaction.amountUSD;

      if (!transaction.challenge) {
        totalEarnings += transaction.amount;

        coefficientData.push({
          x: transaction.date,
          y: (transaction.amount / transaction.duration) * 60,
        });

        earningsData.push({
          x: transaction.date,
          y: totalEarnings,
        });
      }
    });
  }

  const optionsCoefficientChart = {
    chart: {
      id: 'coefficient-chart',
    },
    xaxis: {
      type: 'category',
    },
    tooltip: {
      y: {
        formatter: (val) => formatAmount(val),
      },
    },
  };

  const optionsEarningsChart = {
    chart: {
      id: 'earnings-chart',
    },
    xaxis: {
      type: 'category',
    },
    tooltip: {
      y: {
        formatter: (val) => formatAmount(val),
      },
    },
  };

  return (
    <Layout title="Uber">
      {!userData.uber ? (
        <>
          <div>No hay datos de Uber disponibles.</div>
          <Link to="/NewUberEntry">
            <IconButton aria-label="settings">
              <AddIcon />
            </IconButton>
          </Link>
        </>
      ) : (
        <>
          <CardPendingUber setShowDialog={setShowDialog} />
          <CardTotalMonthlyUber data={groupedUberData}/>
          <CardAverageDailyUber data={groupedUberData}/>
          <CardChallengeUber />
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" align="center">
                Evolución ($/hs) de {getMonthName(currentMonth)}
              </Typography>
              <ReactApexChart
                options={optionsCoefficientChart}
                series={[{ name: '$/Hs', data: coefficientData }]}
                type="line"
                height={300}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" align="center">
                Ganancias Acumuladas de {getMonthName(currentMonth)}
              </Typography>
              <ReactApexChart
                options={optionsEarningsChart}
                series={[{ name: 'Ganancias', data: earningsData }]}
                type="line"
                height={300}
              />
            </Grid>
          </Grid>
          <UberMonthList data={groupedUberData} />
          <Dialog open={showDialog}>
            <DialogTitle>Fondo de mantenimiento del auto</DialogTitle>
            <Typography variant="body1">
              {formatAmount(userData.uber.pending * userData.savings.carMaintenancePercentage)}
            </Typography>
          </Dialog>
        </>
      )}
    </Layout>
  );
};

export default Uber;
