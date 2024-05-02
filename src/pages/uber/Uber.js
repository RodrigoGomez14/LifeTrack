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

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

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
          <CardTotalMonthlyUber/>
          <CardAverageDailyUber/>
          <CardChallengeUber />
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" align="center">
                Evolución ($/hs) de {getMonthName(currentMonth)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" align="center">
                Ganancias Acumuladas de {getMonthName(currentMonth)}
              </Typography>
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
