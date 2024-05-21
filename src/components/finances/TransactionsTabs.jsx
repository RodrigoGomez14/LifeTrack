import React, { useState } from 'react';
import {Accordion,AccordionSummary,AccordionDetails,Grid,Typography,Tabs,Tab,Card,CardHeader,Paper} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName, sumTransactionsByCategory } from '../../utils';
import TransactionsTabsList from './TransactionsTabsList';
import ReactApexChart from 'react-apexcharts';
import { useStore } from '../../store'; 
import { useTheme } from '@mui/material/styles';

const TransactionsTabs = ({ data,type }) => {
  const [tabValue, setTabValue] = useState(0);
  const [yearTabValue, setYearTabValue] = useState(parseInt(new Date().getFullYear()));
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() +1 ;
  const currentYear = currentDate.getFullYear();
  const {dollarRate} = useStore();
  const theme = useTheme();

  const handleTransactionTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const handleYearTabChange = (event, newValue) => {
    setYearTabValue(newValue);
  };
  
  const categories = type==='expenses'?['Auto', 'Servicios' , 'Indoor', 'Supermercado','Transporte','Extras','Exchange']:['Uber', 'Sueldo', 'Freelance', 'Camila', 'Extras','Exchange'];

  const seriesPieChart = [];
  const labelsPieChart = [];

  categories.forEach((category, index) => {
    const total = sumTransactionsByCategory(data[currentYear].months[currentMonth].data, category);
    seriesPieChart.push(total)
    labelsPieChart.push(category)
  });
  const optionsPieChart = {
    labels:labelsPieChart,
    tooltip:{
        y:{
            formatter: val=> formatAmount(val)
        }
    },
  };


  return (
    <Grid container item xs={12}>
        <Grid container itemxs={12} justifyContent='center' spacing={3}>
            <Grid item>
                <Paper elevation={6}>
                    <Card>
                        <CardHeader
                            title={formatAmount(dollarRate['venta'])}
                            subheader="Valor USD"
                        />
                    </Card>
                </Paper>
            </Grid>
            <Grid item>
                <Paper elevation={6}>
                    <Card>
                        <CardHeader
                            title={formatAmount(data[currentYear].months[currentMonth].total)}
                            subheader={`${type==='incomes'?'Ingresos':'Gastos'} de ${getMonthName(currentMonth)}`}
                        />
                    </Card>
                </Paper>
            </Grid>
        </Grid>
        <Grid item xs={12} justifyContent='center'>
            <Grid container item xs={12} justifyContent='center'>
                <Typography variant="h5">Distribucion de {type==='incomes'?'Ingresos':'Gastos'} de {getMonthName(currentMonth)}</Typography>
            </Grid>
            <Grid container item xs={12} justifyContent='center'>
                <Grid item>
                    <ReactApexChart
                        options={optionsPieChart}
                        series={seriesPieChart}
                        type="pie"
                        width={500}
                    />
                </Grid>
            </Grid>
        </Grid>
        <Grid item xs={12}> 
            <Tabs
                value={yearTabValue}
                onChange={handleYearTabChange}
                variant="scrollable"
                scrollButtons="auto"
            >
                {Object.keys(data).reverse().map(year=> (
                    <Tab value={year} label={`${year} - ${formatAmount(data[year].total)}`}/>
                ))}
            </Tabs>
        </Grid>
        <Grid item xs={12}>
            {Object.keys(data).reverse().map(year => (
                yearTabValue === year ? 
                    <Grid container item xs={12} justifyContent='center' spacing={3}>
                        <Grid item xs={12} >
                            <Typography variant="h6" align="center">{year} - Total: {formatAmount(data[year].total)} - USD {formatAmount(data[year].totalUSD)}</Typography>
                        </Grid>
                        <Grid container item xs={12} >
                            {Object.keys(data[year].months).reverse().map(month => (
                                data[year].months[month].data.length?
                                <Grid item xs={12}>
                                    <Accordion key={month}>
                                        <AccordionSummary
                                            style={{ backgroundColor: theme.palette.secondary.main, color: 'white' }}
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <Typography style={{ fontWeight: 'bold' }} variant="subtitle1">{getMonthName(month)} - {formatAmount(data[year].months[month].total)} - USD {formatAmount(data[year].months[month].totalUSD)}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Tabs
                                                value={tabValue}
                                                onChange={handleTransactionTabChange}
                                                variant="scrollable"
                                                scrollButtons="auto"
                                            >
                                                {categories.map((category, index) => (
                                                    <Tab disabled={sumTransactionsByCategory(data[year].months[month].data,category)===0?true:false} label={`${category} - ${formatAmount(sumTransactionsByCategory(data[year].months[month].data,category))}`} key={index} />
                                                ))}
                                            </Tabs>
                                            {categories.map((category, index) => (
                                                <div
                                                    key={index}
                                                    role="tabpanel"
                                                    hidden={tabValue !== index}
                                                    id={`expense-tabpanel-${index}`}
                                                    aria-labelledby={`expense-tab-${index}`}
                                                >
                                                    {tabValue === index && (
                                                        <TransactionsTabsList data={data[year].months[month].data} category={category}/>
                                                    )}
                                                </div>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                                :
                                null
                            ))}
                        </Grid>
                    </Grid>
                :
                null
            ))}
        </Grid>
    </Grid>
  );
};

export default TransactionsTabs;