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
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const seriesLineChart = [];
  let lineChartTotal = 0;
  const seriesColumnChart = [];
  const labelsChart = [];
  userData.uber.data[currentYear].months[currentMonth].data.map(i=>{
    if(!i.challenge){
      lineChartTotal+=i.amount
      seriesLineChart.push(lineChartTotal)
      seriesColumnChart.push(i.amount)
      labelsChart.push(i.date)
    }
    else{
      lineChartTotal+=i.amount
      seriesLineChart[seriesLineChart.length-1]=seriesLineChart[seriesLineChart.length-1]+i.amount
      seriesColumnChart[seriesColumnChart.length-1]=seriesColumnChart[seriesColumnChart.length-1]+i.amount
    }
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
          <Grid container item xs={12} justifyContent='center'>
            <ReactApexChart
                  options={optionsChart}
                  series={[{type:'line',data: seriesLineChart,name:'Acumulado' },{type:'column',data: seriesColumnChart,name:'Diario' }]}
                  type="line"
                  height={300}
                  width={1000}
              />
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
