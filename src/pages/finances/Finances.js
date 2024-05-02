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
          <Grid item>
            <Card style={{width:'150px'}}>
              <CardHeader
                title={formatAmount(dollarRate['venta'])}
                subheader="Valor USD"/>
            </Card>
          </Grid>
        </Grid>
        <Grid container item xs={12} spacing={3}>
          <Grid item xs={12}>
              {Object.keys(userData.finances.expenses).map(year => (
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
                        <TransactionsTabs data={userData.finances.expenses[year]} type="expenses"/>
                      </CustomTabPanel>
                      <CustomTabPanel value={tabValue} index={1}>
                        <TransactionsTabs data={userData.finances.incomes[year]} type="incomes"/>  
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

//<CardHeaderFinances subheader={`Balance ${currentYear}`} title={`${formatAmount((groupedIncomes[currentYear].total-groupedExpenses[currentYear].total))} / USD ${formatAmount((groupedIncomes[currentYear].totalUSD-groupedExpenses[currentYear].totalUSD))}`} cond={groupedIncomes[currentYear].totalUSD-groupedExpenses[currentYear].totalUSD>0}/>
//<CardHeaderFinances subheader={`Balance ${currentMonthName} ${currentYear}`} title={`${formatAmount((groupedIncomes[currentYear].months[currentMonth].total-groupedExpenses[currentYear].months[currentMonth].total))} / USD ${formatAmount((groupedIncomes[currentYear].months[currentMonth].totalUSD-groupedExpenses[currentYear].months[currentMonth].totalUSD))}`} cond={groupedIncomes[currentYear].months[currentMonth].totalUSD-groupedExpenses[currentYear].months[currentMonth].totalUSD>0}/>
