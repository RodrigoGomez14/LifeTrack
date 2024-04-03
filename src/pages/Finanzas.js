import React from 'react';
import Layout from '../components/Layout';
import { Grid, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { formatAmount, getMonthName } from '../formattingUtils';

const Finanzas = ({ incomes, expenses }) => {
  // Función para calcular la suma total de gastos o ingresos en un mes específico
  const calculateTotal = (monthData) => {
    let total = 0;
    Object.values(monthData).forEach(item => {
      total += item.amount;
    });
    return total;
  };

  return (
    <Layout title="Finanzas">
      <div>
        <Typography variant="h1">
          Resumen Financiero
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <div>
              <Typography variant="h4">Gastos</Typography>
              {Object.keys(expenses).map(year => (
                <div key={year}>
                  <Typography variant="h5">{year}</Typography>
                  {Object.keys(expenses[year]).map(month => (
                    <div key={month}>
                      <Typography variant="h6">{getMonthName(month)}</Typography>
                      <List>
                        {Object.values(expenses[year][month]).map(expense => (
                          <ListItem key={expense.date}>
                            <ListItemText primary={`${expense.description} - ${formatAmount(expense.amount)} - Categoria: ${expense.category} `} />
                          </ListItem>
                        ))}
                      </List>
                      <Typography variant="subtitle1">Total: {formatAmount(calculateTotal(expenses[year][month]))}</Typography>
                      <Link to="/NewExpense" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" color="primary">Agregar Gasto</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Grid>
          <Grid item xs={6}>
            <div>
              <Typography variant="h4">Ingresos</Typography>
              {Object.keys(incomes).map(year => (
                <div key={year}>
                  <Typography variant="h5">{year}</Typography>
                  {Object.keys(incomes[year]).map(month => (
                    <div key={month}>
                      <Typography variant="h6">{getMonthName(month)}</Typography>
                      <List>
                        {Object.values(incomes[year][month]).map(income => (
                          <ListItem key={income.date}>
                            <ListItemText primary={`${income.description} - ${formatAmount(income.amount)} - Categoria: ${income.category} `} />
                          </ListItem>
                        ))}
                      </List>
                      <Typography variant="subtitle1">Total: {formatAmount(calculateTotal(incomes[year][month]))}</Typography>
                      <Link to="/NewIncome" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" color="primary">Agregar Ingreso</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Grid>
        </Grid>
      </div>
    </Layout>
  );
};

export default Finanzas;
