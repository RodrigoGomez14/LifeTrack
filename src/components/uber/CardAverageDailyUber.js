import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardHeader, IconButton, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import { formatAmount, getMonthName, getPreviousMonday } from '../../utils'; // Suponiendo que tienes una función que obtiene el lunes anterior
import { useStore } from '../../store'; // Importar el store de Zustand

const CardAverageDailyUber = () => {
  const { userData,dollarRate } = useStore(); // Obtener estados del store
  const [totalMonthlyEarnings, setTotalMonthlyEarnings] = useState(0);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  useEffect(() => {
    // Calcula las ganancias promedio del mes en curso
    let monthlyEarnings = 0;
    let length = 0
    const monthData = userData.uber.data[currentYear].months[currentMonth].data;
    monthData.map((transaction) => {
      monthlyEarnings += transaction.amount;
      if(!transaction.challenge){
        length++
      }
    })
    monthlyEarnings = monthlyEarnings/length

    setTotalMonthlyEarnings(monthlyEarnings);
  }, [userData]); // Vuelve a calcular si data cambia

  return (
    <Grid item>
      <Card>
        <CardHeader
          style={{ backgroundColor: 'grey', color: 'white' }}
          title={
            <>
              <Typography variant="caption">
                Promedio diario {getMonthName(currentMonth)}
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

export default CardAverageDailyUber;
