import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardHeader, IconButton, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import { formatAmount, getMonthName, getPreviousMonday } from '../../utils'; // Suponiendo que tienes una función que obtiene el lunes anterior
import { useStore } from '../../store'; // Importar el store de Zustand

const CardTotalMonthlyUber = () => {
  const { userData, dollarRate } = useStore(); // Obtener estados del store
  const [totalMonthlyEarnings, setTotalMonthlyEarnings] = useState(0);
  const currentDate = new Date();
  const currentMonth = `0${currentDate.getMonth() + 1}`;
  useEffect(() => {
    const currentMonday = getPreviousMonday(); // Obtén el lunes anterior
    const currentYear = currentMonday.getFullYear();
    const currentMonth = (currentMonday.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = currentMonday.getDate().toString().padStart(2, '0');

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
      </Card>
    </Grid>
  );
};

export default CardTotalMonthlyUber;
