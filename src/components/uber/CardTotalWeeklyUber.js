import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardHeader, IconButton, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import { formatAmount, getPreviousMonday } from '../../utils'; // Suponiendo que tienes una función que obtiene el lunes anterior
import { useStore } from '../../store'; // Importar el store de Zustand

const CardTotalWeeklyUber = () => {
  const { userData, dollarRate } = useStore(); // Obtener estados del store
  const [totalWeeklyEarnings, setTotalWeeklyEarnings] = useState(0);

  useEffect(() => {
    const currentMonday = getPreviousMonday(); // Obtén el lunes anterior
    const currentYear = currentMonday.getFullYear();
    const currentMonth = currentMonday.getMonth() + 1;
    const currentDay = currentMonday.getDate().toString();

    // Calcula las ganancias desde el último lunes
    let weeklyEarnings = 0;

    if (userData.uber && userData.uber.data[currentYear] && userData.uber.data[currentYear].data[currentMonth]) {
      const monthData = userData.uber.data[currentYear].data[currentMonth];
      Object.values(monthData.data).forEach((transaction) => {
        if (transaction.date >= `${currentDay}/${currentMonth}/${currentYear}`) {
          weeklyEarnings += transaction.amount;
        }
      });
    }

    setTotalWeeklyEarnings(weeklyEarnings);
  }, [userData]); // Vuelve a calcular si userData cambia

  return (
    <Grid item>
      <Card>
        <CardHeader
          style={{ backgroundColor: 'grey', color: 'white' }}
          title={
            <>
              <Typography variant="caption">
                Ganancia Semanal
              </Typography>
              <Typography variant="h4">
                {formatAmount(totalWeeklyEarnings)}
              </Typography>
              <Typography variant="body2">
                USD {formatAmount(totalWeeklyEarnings / dollarRate['venta'])}
              </Typography>
            </>
          }
        />
      </Card>
    </Grid>
  );
};

export default CardTotalWeeklyUber;
