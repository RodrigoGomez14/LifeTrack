import React, { useState } from 'react';
import {Accordion,AccordionSummary,AccordionDetails,Grid,Typography,Tabs,Tab} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { formatAmount, getMonthName, sumTransactionsByCategory,getCategoryIcon } from '../../utils';
import TransactionsTabsList from './TransactionsTabsList';
import ReactApexChart from 'react-apexcharts';

const TransactionsTabs = ({ data,type }) => {
  const [tabValue, setTabValue] = useState(0);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() +1 ;
  const currentYear = currentDate.getFullYear();

  const categories = type=='expenses'?['Auto', 'Servicios' , 'Indoor', 'Supermercado','Transporte','Extras']:['Uber', 'Sueldo', 'Freelance', 'Camila', 'Extras'];

  const handleExpenseTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const seriesPieChart = [];
  const labelsPieChart = [];

  categories.map((category, index) => {
    const total = sumTransactionsByCategory(data.months[currentMonth].data, category);
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
    <>
    <Grid container xs={12} justifyContent='center'>
        <Grid item>
            <ReactApexChart
                options={optionsPieChart}
                series={seriesPieChart}
                type="pie"
                width={500}
            />
        </Grid>
    </Grid>
    <Grid container xs={12} spacing={3}>
        {Object.keys(data.months).reverse().map(month => (
            data.months[month].data.length?
            <Grid item xs={12}>
                <Accordion key={month}>
                    <AccordionSummary
                        style={{backgroundColor:'#263238', color:'white'}}
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography variant="h6">{getMonthName(month)} - {formatAmount(data.months[month].total)} - USD {formatAmount(data.months[month].totalUSD)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div style={{ width: '100%' }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleExpenseTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                {categories.map((category, index) => (
                                    <Tab disabled={sumTransactionsByCategory(data.months[month].data,category)==0?true:false} label={`${category} - ${formatAmount(sumTransactionsByCategory(data.months[month].data,category))}`} key={index} />
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
                                        <TransactionsTabsList data={data.months[month].data} category={category}/>
                                    )}
                                </div>
                            ))}
                        </div>
                    </AccordionDetails>
                </Accordion>
            </Grid>
            :
            null
        ))}
    </Grid>
    </>
  );
};

export default TransactionsTabs;