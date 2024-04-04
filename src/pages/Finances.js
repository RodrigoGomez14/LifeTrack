import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, ListItemIcon, Grid, Card, CardHeader, IconButton, Box, Tabs, Tab } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName, formatMinutesToHours } from '../formattingUtils';
import { Link } from 'react-router-dom';
import WifiIcon from '@mui/icons-material/Wifi';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HelpIcon from '@mui/icons-material/Help';

const Finances = ({ incomes, expenses }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentMonthName = getMonthName(currentMonth);

  const calculateTotal = (monthData) => {
    let total = 0;
    Object.values(monthData).forEach(item => {
      total += item.amount;
    });
    return total;
  };
  const sumTransactionsByCategory = (transactions, category) => {
    let total = 0;
    for (const transaction of Object.values(transactions)) {
      if (transaction.category === category) {
        total += transaction.amount;
      }
    }
    return total;
  };
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Auto':
        return <DriveEtaIcon />;
      case 'Servicios':
        return <WifiIcon />;
      case 'Indoor':
        return <HomeIcon />;
      case 'Supermercado':
        return <ShoppingBasketIcon />;
      case 'Transporte':
        return <DirectionsBusIcon />;
      case 'Extras':
        return <AddCircleIcon />;
      case 'Uber':
        return <LocalTaxiIcon />;
      case 'Sueldo':
        return <WorkIcon />;
      case 'Freelance':
        return <AttachMoneyIcon />;
      case 'Camila':
        return <PersonIcon />;
      default:
        return <HelpIcon />;
    }
  };
  
  
  const totalIncomes = calculateTotal(incomes[currentYear]?.[currentMonth] || {});
  const totalExpenses = calculateTotal(expenses[currentYear]?.[currentMonth] || {});
  const balance = totalIncomes - totalExpenses;

  const [incomeTabValue, setIncomeTabValue] = useState(0);
  const [expenseTabValue, setExpenseTabValue] = useState(0);

  const handleIncomeTabChange = (event, newValue) => {
    setIncomeTabValue(newValue);
  };

  const handleExpenseTabChange = (event, newValue) => {
    setExpenseTabValue(newValue);
  };

  const categoriesExpenses = ['Auto', 'Servicios' , 'Indoor', 'Supermercado','Transporte','Extras'];
  const categoriesIncomes = ['Uber', 'Sueldo', 'Freelance', 'Camila', 'Extras'];

  return (
    <Layout title="Finanzas">
      <div>
        <Box mb={2} >
          <Grid container spacing={2} justifyContent='center'>
            <Grid item xs={12} sm={3}>
              <Card style={{backgroundColor:'green' , color:'white'}}>
                <CardHeader
                  title={formatAmount(balance)}
                  subheader={`Balance ${currentMonthName}: ${formatAmount(balance)}`}
                />
              </Card>
            </Grid>
          </Grid>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Gastos/Ingresos"
                action={
                  <>
                    <Link to="/NewExpense">
                      <IconButton aria-label="settings">
                        <AddIcon />
                      </IconButton>
                    </Link>
                    <Link to="/NewIncome">
                      <IconButton aria-label="settings">
                        <AddIcon />
                      </IconButton>
                    </Link>
                  </>
                }
              />
              {Object.keys(expenses).map(year => (
                <div key={year}>
                  <Typography variant="h5" gutterBottom>{year}</Typography>
                  <Grid container justifyContent='space-around'>
                    <Grid item xs={6}>
                      {Object.keys(expenses[year]).reverse().map(month => (
                        <Accordion key={month}>
                          <AccordionSummary
                            style={{backgroundColor:'#263238', color:'white'}}
                            expandIcon={<ExpandMoreIcon />}
                          >
                            <Typography variant="h6">{getMonthName(month)} - {formatAmount(calculateTotal(expenses[year][month]))}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <div style={{ width: '100%' }}>
                              <Tabs
                                value={expenseTabValue}
                                onChange={handleExpenseTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                              >
                                {categoriesExpenses.map((category, index) => (
                                  <Tab disabled={sumTransactionsByCategory(expenses[year][month],category)==0?true:false} label={`${category} - ${formatAmount(sumTransactionsByCategory(expenses[year][month],category))}`} key={index} />
                                ))}
                              </Tabs>
                              {categoriesExpenses.map((category, index) => (
                                <div
                                  key={index}
                                  role="tabpanel"
                                  hidden={expenseTabValue !== index}
                                  id={`expense-tabpanel-${index}`}
                                  aria-labelledby={`expense-tab-${index}`}
                                >
                                  {expenseTabValue === index && (
                                    <List>
                                      {Object.values(expenses[year][month]).reverse().map(expense => {
                                        if (expense.category === category) {
                                          return (
                                            <ListItem key={expense.date}>
                                              <ListItemIcon>
                                                {getCategoryIcon(expense.category)}
                                              </ListItemIcon>
                                              <ListItemText
                                                primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{formatAmount(expense.amount)}</Typography>}
                                                secondary={
                                                  <div>
                                                    <Typography variant="body1">{expense.subcategory}</Typography>
                                                    <Typography variant="body1">{expense.description}</Typography>
                                                    <Typography variant="body2" color="textSecondary">Fecha: {expense.date}</Typography>
                                                  </div>
                                                }
                                              />
                                            </ListItem>
                                          );
                                        }
                                        return null;
                                      })}
                                    </List>
                                  )}
                                </div>
                              ))}
                            </div>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Grid>
                    <Grid item xs={6}>
                      {Object.keys(incomes[year]).reverse().map(month => (
                        <Accordion key={month} >
                          <AccordionSummary
                            style={{backgroundColor:'#263238', color:'white'}}
                            expandIcon={<ExpandMoreIcon />}
                          >
                            <Typography variant="h6">{getMonthName(month)} - {formatAmount(calculateTotal(incomes[year][month]))}</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <div style={{ width: '100%' }}>
                              <Tabs
                                value={incomeTabValue}
                                onChange={handleIncomeTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                              >
                                {categoriesIncomes.map((category, index) => (
                                  <Tab disabled={sumTransactionsByCategory(incomes[year][month],category)==0?true:false} label={`${category} - ${formatAmount(sumTransactionsByCategory(incomes[year][month],category))}`} key={index} />
                                ))}
                              </Tabs>
                              {categoriesIncomes.map((category, index) => (
                                <div
                                  key={index}
                                  role="tabpanel"
                                  hidden={incomeTabValue !== index}
                                  id={`income-tabpanel-${index}`}
                                  aria-labelledby={`income-tab-${index}`}
                                >
                                  {incomeTabValue === index && (
                                    <List>
                                      {Object.values(incomes[year][month]).reverse().map(income => {
                                        if (income.category === category) {
                                          return (
                                            <ListItem key={income.date}>
                                              <ListItemIcon>
                                                <DriveEtaIcon />
                                              </ListItemIcon>
                                              <ListItemText
                                                primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{formatAmount(income.amount)}</Typography>}
                                                secondary={
                                                  <div>
                                                    <Typography variant="body1">{income.subcategory}</Typography>
                                                    <Typography variant="body1">{income.description}</Typography>
                                                    <Typography variant="body2" color="textSecondary">Fecha: {income.date}</Typography>
                                                  </div>
                                                }
                                              />
                                            </ListItem>
                                          );
                                        }
                                        return null;
                                      })}
                                    </List>
                                  )}
                                </div>
                              ))}
                            </div>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Grid>
                  </Grid>
                </div>
              ))}
            </Card>
          </Grid>
        </Grid>
      </div>
    </Layout>
  );
};

export default Finances;
