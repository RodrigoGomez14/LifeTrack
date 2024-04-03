import React from 'react';
import Layout from '../components/Layout';
import { Typography, Collapse, List, ListItem, ListItemText, ListItemIcon, Button, LinearProgress } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { formatAmount, getMonthName, formatMinutesToHours } from '../formattingUtils';
import { Link } from 'react-router-dom';
import { database } from '../firebase';


const Uber = ({ data,uid }) => {
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
  const handleResetPending = () =>{
    
    // Obtener la fecha actual
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0')

    database.ref(`${uid}/incomes/${year}/${month}`).push({
      date: `${day}/${month}/${year}`,
      amount: parseFloat(data.pending),
      category:'Uber',
      subCategory:'Semanal Uber',
      description:'Semanal Uber'
    });

    database.ref(`${uid}/uber/pending`).set(0);
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

  // Renderizar los movimientos de Uber
  return (
    <Layout title="Uber">
      <div>
        <Typography variant="h1">
          Pendiente: {formatAmount(data.pending)}
          <Button onClick={handleResetPending} variant="contained" color="primary">
            Reiniciar Pendiente
          </Button>
        </Typography>
        <Link to="/NewUberEntry">
          <Button variant="contained" color="primary">Nueva Entrada</Button>
        </Link>
        {Object.keys(data.data).map(year => (
          <div key={year}>
            <Typography variant="h6">{year}</Typography>
            {Object.keys(data.data[year]).reverse().map(month => {
              const monthName = getMonthName(month);
              const { totalAmount, totalCash, totalDuration, dailyTotal, averageDaily } = calculateTotal(data.data[year][month]);
              return (
                <div key={month}>
                  <Typography variant="subtitle1">
                    {monthName} - Total: {formatAmount(totalAmount)} - Efectivo: {formatAmount(totalCash)} - Tiempo: {formatMinutesToHours(totalDuration)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Promedio diario: {formatAmount(averageDaily)}
                  </Typography>
                  <Collapse in={true} unmountOnExit>
                    <List>
                      {Object.keys(data.data[year][month]).reverse().map(transactionId => {
                        const transaction = data.data[year][month][transactionId];
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
