import React, { useEffect, useState } from 'react';
import { Grid, Typography, Card, CardHeader } from '@mui/material';
import { formatAmount, getMonthName } from '../../utils';
import { useStore } from '../../store'; // Importar el store de Zustand

const CardTotalGasExpenses = ({data}) => {
  const { dollarRate } = useStore(); // Obtener estados del store
  const [totalMonthlyGasExpenses, setTotalMonthlyGasExpenses] = useState(0);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  useEffect(() => {
    let monthlyGasExpenses = 0;

      const monthData = data[currentYear].months[currentMonth].data;
      monthData.map((transaction) => {
        // Considerar solo las transacciones de la categoria AUTO
        if (transaction.category === 'Auto') {
          monthlyGasExpenses += transaction.amount;
        }
      })

    setTotalMonthlyGasExpenses(monthlyGasExpenses);
  }, [data]); // Vuelve a calcular si data cambia

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
