import React from 'react';
import Layout from '../components/Layout';
import { Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, ListItemIcon, Grid, Card, CardHeader, IconButton } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName, formatMinutesToHours } from '../formattingUtils';
import { Link } from 'react-router-dom';
import { database } from '../firebase';

const Uber = ({ data, uid }) => {
  // Verificar si hay datos de Uber disponibles
  if (!data) {
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

  const resetPendingOnMonday = () => {
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 para domingo, 1 para lunes, ..., 6 para sábado
    const pending = parseFloat(data.pending);

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
        description: 'Semanal Uber'
      });

      database.ref(`${uid}/uber/pending`).set(0);
    }
  };

  resetPendingOnMonday(); // Llamar a la función al renderizar el componente para comprobar si es lunes

  // Función para calcular la suma de los montos totales en efectivo y minutos
  const calculateTotal = (monthData) => {
    let totalAmount = 0;
    let totalCash = 0;
    let totalDuration = 0;
    let dailyTotal = {}; // Objeto para almacenar el total diario

    Object.values(monthData).forEach(transaction => {
      totalAmount += transaction.amount || 0;
      totalCash += transaction.cash || 0;
      totalDuration += transaction.duration || 0;
      const transactionDate = transaction.date.split('/')[0]; // Obtener el día de la fecha
      dailyTotal[transactionDate] = (dailyTotal[transactionDate] || 0) + (transaction.amount || 0); // Sumar el monto al total diario
    });

    const averageDaily = totalAmount / Object.keys(dailyTotal).length; // Calcular el promedio diario

    return { totalAmount, totalCash, totalDuration, dailyTotal, averageDaily };
  };
  // Función para calcular el total de un año
  const calculateYearTotal = (yearData) => {
    let total = 0;
    Object.values(yearData).forEach(month => {
      Object.values(month).forEach(transaction => {
        total += transaction.amount || 0;
      });
    });
    return total;
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
              style={{backgroundColor:data.pending>0?'green':'red'}}
              title={formatAmount(data.pending)}
              subheader='Pendiente de pago'
            />
          </Card>
        </Grid>
        {Object.keys(data.data).map(year => (
          <Grid container item xs={12} key={year} justifyContent='center' spacing={2}>
            <Grid item xs={12} >
              <Typography variant="h6" align="center">{year} - Total: {formatAmount(calculateYearTotal(data.data[year]))}</Typography>
            </Grid>
            {Object.keys(data.data[year]).reverse().map(month => {
              const monthName = getMonthName(month);
              const { totalAmount, totalCash, totalDuration, dailyTotal, averageDaily } = calculateTotal(data.data[year][month]);
              return (
                <Grid item xs={8}>
                  <Accordion key={month}>
                    <AccordionSummary
                      style={{ backgroundColor: '#263238', color: 'white' }}
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                        {monthName} - Total: {formatAmount(totalAmount)}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {Object.keys(data.data[year][month]).reverse().map(transactionId => {
                          const transaction = data.data[year][month][transactionId];
                          const coefficient = formatAmount((transaction.amount / transaction.duration) * 60); // Calcular el coeficiente total/duración
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
                                      Monto: {`${formatAmount(transaction.amount)} - USD ${formatAmount(transaction.amount/transaction.valorUSD)}`}
                                    </Typography>
                                    <Typography variant="body1">
                                      Efectivo: {formatAmount(transaction.cash)}
                                    </Typography>
                                    <Typography variant="body1">
                                      Duración: {formatMinutesToHours(transaction.duration)}
                                    </Typography>
                                    <Typography variant="body1">
                                      $/Hs: {coefficient}/Hs
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
