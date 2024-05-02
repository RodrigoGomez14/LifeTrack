import React from 'react';
import Layout from '../../components/layout/Layout';
import { Typography, Grid, Card, CardHeader, Button, Box,Tabs,Tab} from '@mui/material';
import { formatAmount, getMonthName } from '../../utils';
import { Link } from 'react-router-dom';
import TransactionsTabs from '../../components/finances/TransactionsTabs'
import SavingsList from '../../components/finances/SavingsList'
import { useStore } from '../../store'; 
import CardHeaderFinances from '../../components/finances/CardHeaderFinances';

const Finances = () => {
  const {userData,dollarRate} = useStore();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentMonthName = getMonthName(currentMonth);
  const [tabValue, setTabValue] = React.useState(0);
  
  const groupedIncomes = {};
  const groupedExpenses = {};

  // Calcular datos para gráficos limitados al mes actual
  if (userData.incomes || userData.expenses) {
    // Agrupar datos por año y por mes
    Object.keys(userData.incomes).forEach((transactionId) => {
      const transaction = userData.incomes[transactionId];
      const [day, month, year] = transaction.date.split('/').map(Number);
      if (!groupedIncomes[year]) {
        groupedIncomes[year] = { 
          total: 0,totalUSD:0,
          months: {
            1:{ total: 0,totalUSD:0, data: [] },
            2:{ total: 0,totalUSD:0, data: [] },
            3:{ total: 0,totalUSD:0, data: [] },
            4:{ total: 0,totalUSD:0, data: [] },
            5:{ total: 0,totalUSD:0, data: [] },
            6:{ total: 0,totalUSD:0, data: [] },
            7:{ total: 0,totalUSD:0, data: [] },
            8:{ total: 0,totalUSD:0, data: [] },
            9:{ total: 0,totalUSD:0, data: [] },
            10:{ total: 0,totalUSD:0, data: [] },
            11:{ total: 0,totalUSD:0, data: [] },
            12:{ total: 0,totalUSD:0, data: [] }
          }
        }
      }

      groupedIncomes[year].months[month].data.push(transaction);
      groupedIncomes[year].months[month].total+=transaction.amount;
      groupedIncomes[year].months[month].totalUSD+=transaction.amountUSD;
      groupedIncomes[year].total+=transaction.amount;
      groupedIncomes[year].totalUSD+=transaction.amountUSD;
    });

    Object.keys(userData.expenses).forEach((transactionId) => {
      const transaction = userData.expenses[transactionId];
      const [day, month, year] = transaction.date.split('/').map(Number);
      if (!groupedExpenses[year]) {
        groupedExpenses[year] = { 
          total: 0,totalUSD:0,
          months: {
            1:{ total: 0,totalUSD:0, data: [] },
            2:{ total: 0,totalUSD:0, data: [] },
            3:{ total: 0,totalUSD:0, data: [] },
            4:{ total: 0,totalUSD:0, data: [] },
            5:{ total: 0,totalUSD:0, data: [] },
            6:{ total: 0,totalUSD:0, data: [] },
            7:{ total: 0,totalUSD:0, data: [] },
            8:{ total: 0,totalUSD:0, data: [] },
            9:{ total: 0,totalUSD:0, data: [] },
            10:{ total: 0,totalUSD:0, data: [] },
            11:{ total: 0,totalUSD:0, data: [] },
            12:{ total: 0,totalUSD:0, data: [] }
          }
        }
      }

      groupedExpenses[year].months[month].data.push(transaction);
      groupedExpenses[year].months[month].total+=transaction.amount;
      groupedExpenses[year].months[month].totalUSD+=transaction.amountUSD;
      groupedExpenses[year].total+=transaction.amount;
      groupedExpenses[year].totalUSD+=transaction.amountUSD;
    });
  }
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };
  function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
  return (
    <Layout title="Finanzas">
        <Grid container item xs={12} spacing={3} style={{overflow:'scroll',flexWrap:'nowrap'}} >
          <CardHeaderFinances subheader={`Balance ${currentYear}`} title={`${formatAmount((groupedIncomes[currentYear].total-groupedExpenses[currentYear].total))} / USD ${formatAmount((groupedIncomes[currentYear].totalUSD-groupedExpenses[currentYear].totalUSD))}`} cond={groupedIncomes[currentYear].totalUSD-groupedExpenses[currentYear].totalUSD>0}/>
          <CardHeaderFinances subheader={`Balance ${currentMonthName} ${currentYear}`} title={`${formatAmount((groupedIncomes[currentYear].months[currentMonth].total-groupedExpenses[currentYear].months[currentMonth].total))} / USD ${formatAmount((groupedIncomes[currentYear].months[currentMonth].totalUSD-groupedExpenses[currentYear].months[currentMonth].totalUSD))}`} cond={groupedIncomes[currentYear].months[currentMonth].totalUSD-groupedExpenses[currentYear].months[currentMonth].totalUSD>0}/>
          <Grid item>
            <Card style={{width:'150px'}}>
              <CardHeader
                title={formatAmount(dollarRate['venta'])}
                subheader="Valor USD"/>
            </Card>
          </Grid>
        </Grid>
        <Grid container item xs={12} spacing={3} justifyContent='center'>
          <Grid item>
            <Link to="/NewExpense">
              <Button variant='contained'>AÑADIR GASTO</Button>
            </Link>
          </Grid>
          <Grid item>
            <Link to="/NewIncome">
              <Button variant='contained'>AÑADIR INGRESO</Button>
            </Link>
          </Grid>
        </Grid>
        <Grid container item xs={12} spacing={3}>
          <Grid item xs={12}>
              {Object.keys(groupedExpenses).map(year => (
                <div key={year}>
                  <Typography variant="h5" gutterBottom>{year}</Typography>
                  <Grid container>
                    <Grid item xs={12}>
                      <Tabs value={tabValue} onChange={handleChange} centered>
                        <Tab label="Gastos" />
                        <Tab label="Ingresos" />
                        <Tab label="Ahorros" />
                      </Tabs>
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTabPanel value={tabValue} index={0}>
                        <TransactionsTabs data={groupedExpenses[year]} type="expenses"/>
                      </CustomTabPanel>
                      <CustomTabPanel value={tabValue} index={1}>
                        <TransactionsTabs data={groupedIncomes[year]} type="incomes"/>  
                      </CustomTabPanel>
                      <CustomTabPanel value={tabValue} index={2}>
                        <SavingsList data={userData.savings}/>  
                      </CustomTabPanel>
                    </Grid>
                  </Grid>
                </div>
              ))}
          </Grid>
        </Grid>
    </Layout>
  );
};

export default Finances;