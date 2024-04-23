import React, { useState,useEffect} from 'react';
import Layout from '../components/Layout';
import { Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, ListItemIcon, Grid, Card, CardHeader, IconButton, Alert,LinearProgress, CardContent, Button } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName, formatMinutesToHours } from '../formattingUtils';
import { Link } from 'react-router-dom';
import { database } from '../firebase';
import { useStore } from '../store'; // Importar el store de Zustand

const Uber = ({uid, dolar }) => {
  const {userData} = useStore(); // Obtener estados del store
  const [resetDisabled, setResetDisabled] = useState(true);
  useEffect(() => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 (Domingo) - 6 (Sábado)

    // Si el día actual es lunes (1), entonces deshabilita el reset
    setResetDisabled(dayOfWeek !== 1);
  }, []); // Esto se ejecutará solo una vez al montar el componente
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
      
      database.ref(`${uid}/incomes/${year}/data/${month}/data`).push({
        date: `${day}/${month}/${year}`,
        amount: pending,
        amountUSD: parseFloat(pending/dolar['venta']),
        category: 'Uber',
        subCategory: 'Semanal Uber',
        description: 'Semanal Uber',
        valorUSD:dolar['venta']
      });

      // Actualizar totales mensuales y anuales en la base de datos para ingresos
      const yearlyRef = database.ref(`${uid}/incomes/${year}`);
      yearlyRef.transaction((data) => {
        if (data) {
          data.total = (data.total || 0) + parseFloat(pending);
          data.totalUSD = (data.totalUSD || 0) + parseFloat(pending/dolar['venta']);
        }
        return data;
      });

      const monthlyRef = database.ref(`${uid}/incomes/${year}/data/${month}`);
      monthlyRef.transaction((data) => {
        if (data) {
          data.total = (data.total || 0) + parseFloat(pending);
          data.totalUSD = (data.totalUSD || 0) + parseFloat(pending/dolar['venta']);
        }
        return data;
      });
      database.ref(`${uid}/uber/pending`).set(0);
    }
  };

  const completeChallenge = () => {
    const amountValue = parseFloat(userData.uber.challenge.amount);
    const amountUSDValue = amountValue / dolar['venta'];
    const pending = parseFloat(userData.uber.pending);

    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    database.ref(`${uid}/uber/data/${year}/data/${month}/data`).push({
      date: `${day}/${month}/${year}`,
      amount: amountValue,
      amountUSD: amountUSDValue,
      challenge:true,
      valorUSD: dolar['venta']
    });

    // Actualizar totales mensuales en la base de datos para Uber
    const monthlyUberRef = database.ref(`${uid}/uber/data/${year}/data/${month}`);
    monthlyUberRef.transaction((data) => {
      if (data) {
        data.total = (data.total || 0) + amountValue;
        data.totalUSD = (data.totalUSD || 0) + amountUSDValue;
      }
      return data;
    });

    // Actualizar totales anuales en la base de datos para Uber
    const yearlyUberRef = database.ref(`${uid}/uber/data/${year}`);
    yearlyUberRef.transaction((data) => {
      if (data) {
        data.total = (data.total || 0) + amountValue;
        data.totalUSD = (data.totalUSD || 0) + amountUSDValue;
      }
      return data;
    });


    database.ref(`${uid}/uber/pending`).set(pending + amountValue);

    database.ref(`${uid}/uber/challenge`).set({
      amount:0,
      goal:0,
      progress:0
    })
  };
  const resetChallenge = () => {
    database.ref(`${uid}/uber/challenge`).set({
      amount:0,
      goal:0,
      progress:0
    })
  };
  
  const goal = userData.uber.challenge.goal || 1000; // Por defecto, objetivo es 1000
  const progress = userData.uber.challenge.progress || 0;
  const progressPercentage = (progress / goal) * 100;
  return (
    <Layout title="Uber">
      <Grid container spacing={3} justifyContent='center'>
        <Grid item xs={12} sm={6} margin={3}>
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
              title={`${formatAmount(userData.uber.pending)} - USD ${formatAmount(userData.uber.pending / dolar['venta'])}`}
              subheader='Pendiente de pago'
            />
          </Card>
        </Grid>
        {userData.uber.challenge.goal>0?
          <Grid container justifyContent='center'>
            <Card>
                <CardHeader
                  title={formatAmount(userData.uber.challenge.amount)}
                  subheader='Challenge Semanal'
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h2" align="center">{userData.uber.challenge.progress}/{userData.uber.challenge.goal}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <LinearProgress variant="determinate" value={progressPercentage} color='primary'/>  
                    </Grid>
                    <Grid container item alignItems='center' direction='column' spacing={1}>
                      <Grid item>
                        <Button variant='contained' onClick={completeChallenge} disabled={userData.uber.challenge.progress>=userData.uber.challenge.goal?false:true}>
                          COMPLETAR CHALLENGE
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button variant='text' onClick={resetChallenge}>
                          RESETEAR
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
          </Grid>
          :
          <Grid container justifyContent='center'>
            <Card>
                <CardHeader
                  title='Challenge Semanal'
                />
                <CardContent>
                  <Grid container justifyContent='center'>
                    <Grid item xs={12}>
                      <Alert severity='warning'>Aun no hay un Challenge Activo!</Alert>
                    </Grid>
                    <Grid item xs={12}>
                      <Link to="/StartChallenge">
                        <Button variant='contained'>
                          INICIAR CHALLENGE SEMANAL
                        </Button>
                      </Link>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
          </Grid>
        }
        {Object.keys(userData.uber.data).map(year => (
          <Grid container item xs={12} key={year} justifyContent='center' spacing={2}>
            <Grid item xs={12} >
              <Typography variant="h6" align="center">{year} - Total: {formatAmount(userData.uber.data[year].total)} - USD {formatAmount(userData.uber.data[year].totalUSD)}</Typography>
            </Grid>
            {Object.keys(userData.uber.data[year].data).reverse().map(month => {
              const monthName = getMonthName(month);
              return (
                <Grid item xs={8}>
                  <Accordion key={month}>
                    <AccordionSummary
                      style={{ backgroundColor: '#263238', color: 'white' }}
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                        {monthName} - Total: {formatAmount(userData.uber.data[year].data[month].total)} - USD {formatAmount(userData.uber.data[year].data[month].totalUSD)}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {Object.keys(userData.uber.data[year].data[month].data).reverse().map(transactionId => {
                          const transaction = userData.uber.data[year].data[month].data[transactionId];
                          const coefficient = (transaction.amount / transaction.duration) * 60; // Calcular el coeficiente total/duración
                          return (
                            transaction.challenge?
                              <ListItem key={transactionId}>
                                <ListItemIcon>
                                  <DriveEtaIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{transaction.date} - Challenge</Typography>}
                                  secondary={
                                    <div>
                                      <Typography variant="body1">
                                        Monto: {`${formatAmount(transaction.amount)} - USD ${formatAmount(transaction.amountUSD)}`}
                                      </Typography>
                                      <Typography variant="body1">
                                        1 USD = {formatAmount(transaction.valorUSD)} ARS
                                      </Typography>
                                    </div>
                                  }
                                />
                              </ListItem>
                              :
                              <ListItem key={transactionId}>
                                <ListItemIcon>
                                  <DriveEtaIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{transaction.date}</Typography>}
                                  secondary={
                                    <div>
                                      <Typography variant="body1">
                                        Monto: {`${formatAmount(transaction.amount)} - USD ${formatAmount(transaction.amountUSD)}`}
                                      </Typography>
                                      <Typography variant="body1">
                                        Efectivo: {formatAmount(transaction.cash)} - USD {formatAmount(transaction.cashUSD)}
                                      </Typography>
                                      <Typography variant="body1">
                                        Duración: {formatMinutesToHours(transaction.duration)}
                                      </Typography>
                                      <Typography variant="body1">
                                        Viajes: {transaction.travels}
                                      </Typography>
                                      <Typography variant="body1">
                                        $/Hs: {formatAmount(coefficient)}/Hs - USD {formatAmount(coefficient / transaction.valorUSD)}/Hs
                                      </Typography>
                                      <Typography variant="body1">
                                        1 USD = {formatAmount(transaction.valorUSD)} ARS
                                      </Typography>
                                    </div>
                                  }
                                />
                              </ListItem>
                          );
                        })}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default Uber;
