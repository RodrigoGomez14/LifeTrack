import React from 'react';
import Layout from '../components/Layout';
import { Typography, Collapse, List, ListItem, ListItemText, ListItemIcon, Button, LinearProgress } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { formatAmount, getMonthName, formatMinutesToHours } from '../formattingUtils';
import { Link } from 'react-router-dom';

const Uber = ({ data }) => {
  // Verificar si hay datos de Uber disponibles
  if (!data) {
    return (
      <Layout title="Uber">
        <div>No hay datos de Uber disponibles.</div>
        <Link to="/NewUberEntry">
          <Button variant="contained" color="primary">Nueva Entrada</Button>
        </Link>
      </Layout>
    );
  }

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

  // Calcular el monto a depositar restando el efectivo recibido del total general
  const calculateDepositAmount = (totalAmount, totalCash) => {
    return totalAmount - totalCash;
  };

  // Renderizar los movimientos de Uber
  return (
    <Layout title="Uber">
      <div>
        <Link to="/NewUberEntry">
          <Button variant="contained" color="primary">Nueva Entrada</Button>
        </Link>
        {Object.keys(data).map(year => (
          <div key={year}>
            <Typography variant="h6">{year}</Typography>
            {Object.keys(data[year]).reverse().map(month => {
              const monthName = getMonthName(month);
              const { totalAmount, totalCash, totalDuration, dailyTotal, averageDaily } = calculateTotal(data[year][month]);
              const depositAmount = calculateDepositAmount(totalAmount, totalCash);

              return (
                <div key={month}>
                  <Typography variant="subtitle1">
                    {monthName} - Total: {formatAmount(totalAmount)} - Efectivo: {formatAmount(totalCash)} - Tiempo: {formatMinutesToHours(totalDuration)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Promedio diario: {formatAmount(averageDaily)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Monto a depositar: {formatAmount(depositAmount)}
                  </Typography>
                  <Collapse in={true} unmountOnExit>
                    <List>
                      {Object.keys(data[year][month]).map(transactionId => {
                        const transaction = data[year][month][transactionId];
                        const coefficient = formatAmount((transaction.amount / transaction.duration)*60); // Calcular el coeficiente total/duración
                        return (
                          <ListItem key={transactionId}>
                            <ListItemIcon>
                              <DriveEtaIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={transaction.date}
                              secondary={`Monto: ${formatAmount(transaction.amount)} - Efectivo: ${formatAmount(transaction.cash)} - Duración: ${transaction.duration} Minutos - ${coefficient}/Hs`}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Uber;
