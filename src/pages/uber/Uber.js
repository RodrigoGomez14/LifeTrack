import React, { useState } from 'react';
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
  let meanCoeficient = 0;
  let meanDuration = 0;

  // Calcular datos para gráficos limitados al mes actual
  if (userData.uber.data[currentYear] && userData.uber.data[currentYear].data[currentMonth]) {
    Object.keys(userData.uber.data[currentYear].data[currentMonth].data).forEach((transactionId) => {
      const transaction = userData.uber.data[currentYear].data[currentMonth].data[transactionId];
      if (!transaction.challenge) {
        totalEarnings += transaction.amount;
        earningsData.push({
          x: transaction.date,
          y: totalEarnings,
        });
        meanCoeficient += (transaction.amount / transaction.duration) * 60;
        coefficientData.push({
          x: transaction.date,
          y: (transaction.amount / transaction.duration) * 60,
        });
        meanDuration += transaction.duration
      }
    });
    meanCoeficient = meanCoeficient/Object.keys(userData.uber.data[currentYear].data[currentMonth].data).length
    meanDuration = meanDuration/Object.keys(userData.uber.data[currentYear].data[currentMonth].data).length
  }

  // Configuración para el gráfico de línea para coeficiente
  const optionsCoefficientChart = {
    chart: {
      id: 'coefficient-chart',
      sparkline: {
        enabled: true
      },
    },
    xaxis: {
      type: 'category',
    },
    stroke:{
      curve: 'smooth',
    },
    tooltip: {
      y: {
        formatter: (val) => formatAmount(val),
      },
    },
  };

  // Configuración para el gráfico de línea para ganancias acumuladas
  const optionsEarningsChart = {
    chart: {
      id: 'earnings-chart',
    },
    xaxis: {
      type: 'category',
    },
    yaxis:{
      labels:{
        formatter: (val) => formatAmount(val),
      }
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
          <CardTotalGasExpenses/>
          <CardTotalMonthlyUber/>
          <CardAverageDailyUber/>
          <CardChallengeUber/>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" align="center">
                Evolución ($/hs) de {getMonthName(currentMonth)}
              </Typography>
              <Typography variant="h6" align="center">
                {formatMinutesToHours(meanDuration)}
              </Typography>
              <Typography variant="h6" align="center">
                {formatAmount(meanCoeficient)}
              </Typography>
              <Typography variant="h6" align="center">
                {formatAmount(parseFloat(meanCoeficient)*parseFloat(meanDuration/60))}
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
          <UberMonthList data={userData.uber.data} />
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
