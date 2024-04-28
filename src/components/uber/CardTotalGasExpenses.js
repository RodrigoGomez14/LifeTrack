import React, { useEffect, useState } from 'react';
import { Grid, Typography, Card, CardHeader } from '@mui/material';
import { formatAmount, getMonthName } from '../../utils';
import { useStore } from '../../store'; // Importar el store de Zustand

const CardTotalGasExpenses = () => {
  const { userData, dollarRate } = useStore(); // Obtener estados del store
  const [totalMonthlyGasExpenses, setTotalMonthlyGasExpenses] = useState(0);
  const currentDate = new Date();
  const currentMonth = `0${currentDate.getMonth() + 1}`;
  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Convertir a formato de dos dígitos

    let monthlyGasExpenses = 0;

    if (userData.expenses && userData.expenses[currentYear] && userData.expenses[currentYear].data[currentMonth]) {
      const monthData = userData.expenses[currentYear].data[currentMonth];
      Object.values(monthData.data).forEach((transaction) => {
        // Considerar solo las transacciones relacionadas con el auto
        if (transaction.category === 'Auto') {
          monthlyGasExpenses += transaction.amount;
        }
      });
    }

    setTotalMonthlyGasExpenses(monthlyGasExpenses);
  }, [userData]); // Vuelve a calcular si userData cambia

  return (
    <Grid item>
      <Card>
        <CardHeader
          style={{ backgroundColor: 'grey', color: 'white' }}
          title={
            <>
              <Typography variant="caption">
                Gastos Totales en Auto en {getMonthName(currentMonth)}
              </Typography>
              <Typography variant="h4">
                {formatAmount(totalMonthlyGasExpenses)}
              </Typography>
              <Typography variant="body2">
                USD {formatAmount(totalMonthlyGasExpenses / dollarRate['venta'])}
              </Typography>
            </>
          }
        />
      </Card>
    </Grid>
  );
};

export default CardTotalGasExpenses;
