// Uber.js
import React from 'react';
import Layout from '../components/Layout';
import { Typography, Collapse, List, ListItem, ListItemText, ListItemIcon, Button } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { formatAmount, getMonthName, formatMinutesToHours } from '../formattingUtils';
import { Link } from 'react-router-dom';

const Uber = ({ data }) => {
  // Verificar si hay datos de Uber disponibles
  if (!data) {
    return (
      <Layout title="Uber">
        <div>No hay datos de Uber disponibles.</div>
      </Layout>
    );
  }

  // Función para calcular la suma de los montos totales en efectivo y minutos
  const calculateTotal = (monthData) => {
    let totalAmount = 0;
    let totalCash = 0;
    let totalDuration = 0;
    Object.values(monthData).forEach(transaction => {
      totalAmount += transaction.amount || 0;
      totalCash += transaction.cash || 0;
      totalDuration += transaction.duration || 0;
    });
    return { totalAmount, totalCash, totalDuration };
  };

  // Renderizar los movimientos de Uber
  return (
    <Layout title="Uber">
      <div>
        <Typography variant="h4" gutterBottom>
          Movimientos de Uber
        </Typography>
        <Link to="/NewUberEntry">
          <Button variant="contained" color="primary">Nueva Entrada</Button>
        </Link>
        {Object.keys(data).map(year => (
          <div key={year}>
            <Typography variant="h6">{year}</Typography>
            {Object.keys(data[year]).map(month => {
              const monthName = getMonthName(month);
              const { totalAmount, totalCash, totalDuration } = calculateTotal(data[year][month]);
              return (
                <div key={month}>
                  <Typography variant="subtitle1">
                    {monthName} - Total: {formatAmount(totalAmount)} - Efectivo: {formatAmount(totalCash)} - Tiempo: {formatMinutesToHours(totalDuration)}
                  </Typography>
                  <Collapse in={true} unmountOnExit>
                    <List>
                      {Object.keys(data[year][month]).map(transactionId => (
                        <ListItem key={transactionId}>
                          <ListItemIcon>
                            <DriveEtaIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={data[year][month][transactionId].date}
                            secondary={`Monto: ${formatAmount(data[year][month][transactionId].amount)} - Efectivo: ${formatAmount(data[year][month][transactionId].cash)} - Duración: ${data[year][month][transactionId].duration} Minutos`}
                          />
                        </ListItem>
                      ))}
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
