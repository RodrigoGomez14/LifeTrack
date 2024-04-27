import React, { useState } from 'react';
import {Accordion,AccordionSummary,AccordionDetails,Grid,Typography,Tabs,Tab} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName, sumTransactionsByCategory,getCategoryIcon } from '../../utils';
import TransactionsTabsList from './TransactionsTabsList';

const TransactionsTabs = ({ data,type }) => {
  const [expenseTabValue, setExpenseTabValue] = useState(0);

  const handleExpenseTabChange = (event, newValue) => {
    setExpenseTabValue(newValue);
  };
  const categories = type=='expenses'?['Auto', 'Servicios' , 'Indoor', 'Supermercado','Transporte','Extras']:['Uber', 'Sueldo', 'Freelance', 'Camila', 'Extras'];

  return (
    <Grid item xs={12}>
        {Object.keys(data).reverse().map(month => (
            <Accordion key={month}>
                <AccordionSummary
                    style={{backgroundColor:'#263238', color:'white'}}
                    expandIcon={<ExpandMoreIcon />}
                >
                    <Typography variant="h6">{getMonthName(month)} - {formatAmount(data[month].total)} - USD {formatAmount(data[month].totalUSD)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{ width: '100%' }}>
                        <Tabs
                            value={expenseTabValue}
                            onChange={handleExpenseTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            {categories.map((category, index) => (
                                <Tab disabled={sumTransactionsByCategory(data[month].data,category)==0?true:false} label={`${category} - ${formatAmount(sumTransactionsByCategory(data[month].data,category))}`} key={index} />
                            ))}
                        </Tabs>
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                role="tabpanel"
                                hidden={expenseTabValue !== index}
                                id={`expense-tabpanel-${index}`}
                                aria-labelledby={`expense-tab-${index}`}
                            >
                                {expenseTabValue === index && (
                                    <TransactionsTabsList data={data[month].data} category={category}/>
                                )}
                            </div>
                        ))}
                    </div>
                </AccordionDetails>
            </Accordion>
        ))}
    </Grid>
  );
};

export default TransactionsTabs;
