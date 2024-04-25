import React, { useState,useEffect} from 'react';
import Layout from '../components/Layout';
import { Typography, Grid, Card, CardHeader, IconButton, Alert} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';
import UberMonth from '../components/UberMonth'
import { formatAmount } from '../utils';
import { Link } from 'react-router-dom';
import { database } from '../firebase';
import { useStore } from '../store'; // Importar el store de Zustand
import { auth } from '../firebase'; // Importar el módulo de autenticación de Firebase
import CardChallengeUber from '../components/CardChallengeUber';

const Uber = () => {
  const {userData,dollarRate} = useStore(); // Obtener estados del store
  const [resetDisabled, setResetDisabled] = useState(true);

  useEffect(() => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 (Domingo) - 6 (Sábado)

    // Si el día actual es lunes (1), entonces deshabilita el reset
    setResetDisabled(dayOfWeek !== 1);
  }, []); 

  // Verificar si hay datos de Uber disponibles
  if (!userData.uber) {
    return (
      <Layout title="Uber">
        <div>No hay datos de Uber disponibles.</div>
        <Link to="/NewUberEntry">
          <IconButton aria-label="settings">
            <AddIcon />
          </IconButton>
        </Link>
      </Layout>
    );
  }

  const resetPending = () => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 para domingo, 1 para lunes, ..., 6 para sábado
    const pending = parseFloat(userData.uber.pending);

    // Verificar si hoy es lunes (dayOfWeek === 1)
    if (dayOfWeek === 1 && pending > 0) {
      const year = currentDate.getFullYear().toString();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      
      database.ref(`${auth.currentUser.uid}/incomes/${year}/data/${month}/data`).push({
        date: `${day}/${month}/${year}`,
        amount: pending,
        amountUSD: parseFloat(pending/dollarRate['venta']),
        category: 'Uber',
        subCategory: 'Semanal Uber',
        description: 'Semanal Uber',
        valorUSD:dollarRate['venta']
      });

      // Actualizar totales mensuales y anuales en la base de datos para ingresos
      const yearlyRef = database.ref(`${auth.currentUser.uid}/incomes/${year}`);
      yearlyRef.transaction((data) => {
        if (data) {
          data.total = (data.total || 0) + parseFloat(pending);
          data.totalUSD = (data.totalUSD || 0) + parseFloat(pending/dollarRate['venta']);
        }
        return data;
      });

      const monthlyRef = database.ref(`${auth.currentUser.uid}/incomes/${year}/data/${month}`);
      monthlyRef.transaction((data) => {
        if (data) {
          data.total = (data.total || 0) + parseFloat(pending);
          data.totalUSD = (data.totalUSD || 0) + parseFloat(pending/dollarRate['venta']);
        }
        return data;
      });
      database.ref(`${auth.currentUser.uid}/uber/pending`).set(0);
      database.ref(`${auth.currentUser.uid}/savings/carMaintenance`).set(userData.savings.carMaintenance + parseFloat(pending*0.15));

      // Agregar el ingreso de efectivo a la base de datos para ingresos
      database.ref(`${auth.currentUser.uid}/savings/carMaintenanceHistory`).push({
        date: `${day}/${month}/${year}`,
        amount: parseFloat(pending*0.15),
        amountUSD: parseFloat(pending*0.15)/dollarRate['venta'],
        newTotal: userData.savings.carMaintenance+parseFloat(pending*0.15),
        newTotalUSD: (userData.savings.carMaintenance/dollarRate['venta'])+(parseFloat(pending*0.15)/dollarRate['venta'])
      });
    }
  };

  return (
    <Layout title="Uber">
      <Grid container item xs={12}justifyContent='center'>
        <Grid item>
          <Card>
            <CardHeader
              action={
                <>
                  <IconButton 
                    aria-label="settings"
                    disabled={resetDisabled}
                    onClick={resetPending} 
                  >
                    <RestoreIcon />
                  </IconButton>
                  <Link to="/NewUberEntry">
                    <IconButton aria-label="settings">
                      <AddIcon />
                    </IconButton>
                  </Link>
                </>
              }
              style={{backgroundColor:userData.uber.pending > 0 ? 'green' : 'red'}}
              title={`${formatAmount(userData.uber.pending)} - USD ${formatAmount(userData.uber.pending / dollarRate['venta'])}`}
              subheader={<>
              <Typography variant="body1">
                  Pendiente de Pago
              </Typography>
              <Alert variant='filled' severity='info'>
                  Mantenimiento del Auto: {formatAmount(parseFloat(userData.uber.pending*0.15))}
              </Alert>
              </>}
            />
          </Card>
        </Grid>
      </Grid>
      <CardChallengeUber data={userData.uber.challenge} pend={userData.uber.pending}/>
      {Object.keys(userData.uber.data).map(year => (
        <Grid container item xs={12} key={year} justifyContent='center' spacing={2}>
          <Grid item xs={12} >
            <Typography variant="h6" align="center">{year} - Total: {formatAmount(userData.uber.data[year].total)} - USD {formatAmount(userData.uber.data[year].totalUSD)}</Typography>
          </Grid>
          {Object.keys(userData.uber.data[year].data).reverse().map(month => (
            <UberMonth data={userData.uber.data[year].data[month]} month={month}/>
          ))}
        </Grid>
      ))}
    </Layout>
  );
};

export default Uber;
