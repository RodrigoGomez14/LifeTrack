import React from 'react';
import Layout from '../components/Layout';
import { Typography, Grid, Card, CardHeader, Button, Box,Tabs,Tab} from '@mui/material';
import { formatAmount, getMonthName } from '../utils';
import { Link } from 'react-router-dom';
import TransactionsTabs from '../components/TransactionsTabs'
import SavingsList from '../components/SavingsList'
import { useStore } from '../store'; // Importar el store de Zustand

const Finances = () => {
  const {userData,dollarRate} = useStore(); // Obtener estados del store
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentMonthName = getMonthName(currentMonth);
  const [tabValue, setTabValue] = React.useState(0);

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
        <Grid container item xs={12} spacing={3} >
          <Grid item xs={12} sm={4}>
            <Card style={{backgroundColor:userData.incomes[currentYear].totalUSD-userData.expenses[currentYear].totalUSD>0?'green':"red" , color:'white'}}>
              <CardHeader
                title={`${formatAmount((userData.incomes[currentYear].total-userData.expenses[currentYear].total))} / USD ${formatAmount((userData.incomes[currentYear].totalUSD-userData.expenses[currentYear].totalUSD))}`}
                subheader={`Balance ${currentYear}`}/>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card style={{backgroundColor:userData.incomes[currentYear].data[`0${currentMonth}`].totalUSD-userData.expenses[currentYear].data[`0${currentMonth}`].totalUSD>0?'green':"red" , color:'white'}}>
              <CardHeader
                title={`${formatAmount((userData.incomes[currentYear].data[`0${currentMonth}`].total-userData.expenses[currentYear].data[`0${currentMonth}`].total))} / USD ${formatAmount((userData.incomes[currentYear].data[`0${currentMonth}`].totalUSD-userData.expenses[currentYear].data[`0${currentMonth}`].totalUSD))}`}
                subheader={`Balance ${currentMonthName}`}/>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
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
              {Object.keys(userData.expenses).map(year => (
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
                        <TransactionsTabs data={userData.expenses[year].data} type="expenses"/>
                      </CustomTabPanel>
                      <CustomTabPanel value={tabValue} index={1}>
                        <TransactionsTabs data={userData.incomes[year].data} type="incomes"/>  
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