import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardHeader, CardContent, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import { formatAmount, getMonthName, getPreviousMonday } from '../../utils'; // Suponiendo que tienes una función que obtiene el lunes anterior
import { useStore } from '../../store'; // Importar el store de Zustand
import ReactApexChart from 'react-apexcharts';

const CardTotalMonthlyUber = () => {
  const { userData, dollarRate } = useStore(); // Obtener estados del store
  const [totalMonthlyEarnings, setTotalMonthlyEarnings] = useState(0);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let totalEarnings = 0;
  const earningsData = [];
  const labels = [];

  // Calcular datos para gráficos limitados al mes actual
  if (userData.uber.data[currentYear] && userData.uber.data[currentYear].data[currentMonth]) {
    Object.keys(userData.uber.data[currentYear].data[currentMonth].data).forEach((transactionId) => {
      const transaction = userData.uber.data[currentYear].data[currentMonth].data[transactionId];
        earningsData.push(totalEarnings+= transaction.amount);
        labels.push(transaction.date);
    });
  }

  // Configuración para el gráfico de línea para ganancias acumuladas
  const optionsEarningsChart = {
    labels,
    chart: {
      id: 'earnings-chart',
      sparkline:{
        enabled:true
      }
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

  useEffect(() => {
    const currentMonday = getPreviousMonday(); // Obtén el lunes anterior
    const currentYear = currentMonday.getFullYear();
    const currentMonth = (currentMonday.getMonth() + 1).toString();
    const currentDay = currentMonday.getDate().toString();

    // Calcula las ganancias desde el último lunes
    let MonthlyEarnings = 0;

    if (userData.uber && userData.uber.data[currentYear] && userData.uber.data[currentYear].data[currentMonth]) {
      const monthData = userData.uber.data[currentYear].data[currentMonth];
      Object.values(monthData.data).forEach((transaction) => {
        MonthlyEarnings += transaction.amount;
      });
    }

    setTotalMonthlyEarnings(MonthlyEarnings);
  }, [userData]); // Vuelve a calcular si userData cambia

  return (
    <Grid item>
      <Card>
        <CardHeader
          style={{ backgroundColor: 'grey', color: 'white' }}
          title={
            <>
              <Typography variant="caption">
                Ganancia de {getMonthName(currentMonth)}
              </Typography>
              <Typography variant="h4">
                {formatAmount(totalMonthlyEarnings)}
              </Typography>
              <Typography variant="body2">
                USD {formatAmount(totalMonthlyEarnings / dollarRate['venta'])}
              </Typography>
            </>
          }
        />
        <CardContent>
          <ReactApexChart
              options={optionsEarningsChart}
              series={[{ name: 'Ganancias', data: earningsData }]}
              type="line"
              height={100}
            />
        </CardContent>
      </Card>
    </Grid>
  );
};

export default CardTotalMonthlyUber;
