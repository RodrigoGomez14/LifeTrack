import React,{useState} from 'react';
import Layout from '../../components/layout/Layout';
import { Typography, Grid, Card, CardHeader, Button, Box,Tabs,Tab} from '@mui/material';
import { formatAmount, getMonthName } from '../../utils';
import { Link } from 'react-router-dom';
import TransactionsTabs from '../../components/finances/TransactionsTabs'
import SavingsTab from '../../components/finances/SavingsTab'
import { useStore } from '../../store'; 
import CardHeaderFinances from '../../components/finances/CardHeaderFinances';
import { useTheme } from '@mui/material/styles';
const Finances = () => {
  const {userData} = useStore();
  const [tabValue, setTabValue] = useState(0);
  
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
          children
        )}
      </div>
    );
  }
  
  return (
    <Layout title="Finanzas">
      <Grid container item xs={12} justifyContent='center'>
        <Tabs value={tabValue} onChange={handleChange} centered>
          <Tab label="Gastos" />
          <Tab label="Ingresos" />
          <Tab label="Ahorros" />
        </Tabs>
      </Grid>
      <Grid container item xs={12} justifyContent='center'>
        <CustomTabPanel value={tabValue} index={0}>
          <TransactionsTabs data={userData.finances.expenses} type="expenses"/>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          <TransactionsTabs data={userData.finances.incomes} type="incomes"/>  
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={2}>
          <SavingsTab data={userData.savings}/>  
        </CustomTabPanel>
      </Grid>
    </Layout>
  );
};

export default Finances;