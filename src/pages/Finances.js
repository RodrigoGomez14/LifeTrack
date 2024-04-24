import React from 'react';
import Layout from '../components/Layout';
import { Typography, Grid, Card, CardHeader, Button, Box,Tabs,Tab} from '@mui/material';
import TabPanel from '@mui/lab/TabPanel'
import AddIcon from '@mui/icons-material/Add';
import { formatAmount, getMonthName } from '../formattingUtils';
import { Link } from 'react-router-dom';
import TransactionsList from '../components/TransactionsList'

const Finances = ({ incomes, expenses,dolar }) => {
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
            <Card style={{backgroundColor:incomes[currentYear].totalUSD-expenses[currentYear].totalUSD>0?'green':"red" , color:'white'}}>
              <CardHeader
                title={`${formatAmount((incomes[currentYear].total-expenses[currentYear].total))} / USD ${formatAmount((incomes[currentYear].totalUSD-expenses[currentYear].totalUSD))}`}
                subheader={`Balance ${currentYear}`}/>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card style={{backgroundColor:incomes[currentYear].data[`0${currentMonth}`].totalUSD-expenses[currentYear].data[`0${currentMonth}`].totalUSD>0?'green':"red" , color:'white'}}>
              <CardHeader
                title={`${formatAmount((incomes[currentYear].data[`0${currentMonth}`].total-expenses[currentYear].data[`0${currentMonth}`].total))} / USD ${formatAmount((incomes[currentYear].data[`0${currentMonth}`].totalUSD-expenses[currentYear].data[`0${currentMonth}`].totalUSD))}`}
                subheader={`Balance ${currentMonthName}`}/>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardHeader
                title={formatAmount(dolar['venta'])}
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
              {Object.keys(expenses).map(year => (
                <div key={year}>
                  <Typography variant="h5" gutterBottom>{year}</Typography>
                  <Grid container>
                    <Grid item xs={12}>
                      <Tabs value={tabValue} onChange={handleChange} centered>
                        <Tab label="Gastos" />
                        <Tab label="Ingresos" />
                      </Tabs>
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTabPanel value={tabValue} index={0}>
                        <TransactionsList data={expenses[year].data} type="expenses"/>
                      </CustomTabPanel>
                      <CustomTabPanel value={tabValue} index={1}>
                        <TransactionsList data={incomes[year].data} type="incomes"/>  
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