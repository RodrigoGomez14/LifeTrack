import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardHeader, Paper } from '@mui/material';
import { formatAmount, getMonthName } from '../../utils'; // Suponiendo que tienes una función que obtiene el lunes anterior
import { useStore } from '../../store'; // Importar el store de Zustand

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
    monthData.forEach(transaction=>{
      MonthlyEarnings += transaction.amount;
    })

    setTotalMonthlyEarnings(MonthlyEarnings);
  }, [currentMonth, currentYear, userData]); // Vuelve a calcular si data cambia

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
