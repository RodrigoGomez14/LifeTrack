import React, { useState,useEffect} from 'react';
import Layout from '../components/Layout';
import { Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, ListItemIcon, Grid, Card, CardHeader, IconButton, Button } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName, formatMinutesToHours } from '../formattingUtils';
import { Link } from 'react-router-dom';
import { database } from '../firebase';

const Uber = ({ datauber, uid, dolar }) => {
  const [resetDisabled, setResetDisabled] = useState(true);
  useEffect(() => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 (Domingo) - 6 (Sábado)

    // Si el día actual es lunes (1), entonces deshabilita el reset
    setResetDisabled(dayOfWeek !== 1);
  }, []); // Esto se ejecutará solo una vez al montar el componente

  // Verificar si hay datos de Uber disponibles
  if (!datauber) {
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
    const pending = parseFloat(datauber.pending);

    // Verificar si hoy es lunes (dayOfWeek === 1)
    if (dayOfWeek === 1 && pending > 0) {
      const year = currentDate.getFullYear().toString();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');

      database.ref(`${uid}/incomes/${year}/${month}`).push({
        date: `${day}/${month}/${year}`,
        amount: pending,
        category: 'Uber',
        subCategory: 'Semanal Uber',
        description: 'Semanal Uber',
        valorUSD:dolar['venta']
      });

      database.ref(`${uid}/uber/pending`).set(0);
    }
  };
  return (
    <Layout title="Uber">
      <Grid container spacing={3} justifyContent='center'>
        <Grid item xs={12} sm={6} margin={3}>
          <Card>
            <CardHeader
              action={
                <Link to="/NewUberEntry">
                  <IconButton aria-label="settings">
                    <AddIcon />
                  </IconButton>
                </Link>
              }
              style={{backgroundColor:datauber.pending > 0 ? 'green' : 'red'}}
              title={`${formatAmount(datauber.pending)} - USD ${formatAmount(datauber.pending / dolar['venta'])}`}
              subheader='Pendiente de pago'
            />
            <Button 
              onClick={resetPending} 
              disabled={resetDisabled} 
              variant="contained" 
              color="primary"
            >
              Resetear Pendiente Semanal
            </Button>
          </Card>
        </Grid>
        {Object.keys(datauber.data).map(year => (
          <Grid container item xs={12} key={year} justifyContent='center' spacing={2}>
            <Grid item xs={12} >
              <Typography variant="h6" align="center">{year} - Total: {formatAmount(datauber.data[year].total)} - USD {formatAmount(datauber.data[year].totalUSD)}</Typography>
            </Grid>
            {Object.keys(datauber.data[year].data).reverse().map(month => {
              const monthName = getMonthName(month);
              return (
                <Grid item xs={8}>
                  <Accordion key={month}>
                    <AccordionSummary
                      style={{ backgroundColor: '#263238', color: 'white' }}
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                        {monthName} - Total: {formatAmount(datauber.data[year].data[month].total)} - USD {formatAmount(datauber.data[year].data[month].totalUSD)}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {Object.keys(datauber.data[year].data[month].data).reverse().map(transactionId => {
                          const transaction = datauber.data[year].data[month].data[transactionId];
                          const coefficient = (transaction.amount / transaction.duration) * 60; // Calcular el coeficiente total/duración
                          return (
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
