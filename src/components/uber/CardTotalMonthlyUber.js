import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardHeader, Paper, Alert } from '@mui/material';
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


  useEffect(() => {
    // Calcula las ganancias del mes en curso
    let MonthlyEarnings = 0;

    const monthData = userData.uber.data[currentYear].months[currentMonth].data;
    monthData.map(transaction=>{
      MonthlyEarnings += transaction.amount;
    })

    setTotalMonthlyEarnings(MonthlyEarnings);
  }, [userData]); // Vuelve a calcular si data cambia

  return (
    <Grid item>
      <Paper elevation={6}>
        <Card>
          <CardHeader
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
        </Card>
      </Paper>
    </Grid>
  );
};

export default CardTotalMonthlyUber;
