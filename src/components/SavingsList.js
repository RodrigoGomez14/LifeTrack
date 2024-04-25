import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName, sumTransactionsByCategory,getCategoryIcon } from '../utils';

const SavingsList = ({ data }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleExpenseTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const categories = ['Mantenimiento Auto']

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
                            value={tabValue}
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
                            hidden={tabValue !== index}
                            id={`expense-tabpanel-${index}`}
                            aria-labelledby={`expense-tab-${index}`}
                        >
                            {tabValue === index && (
                            <List>
                                {Object.values(data[month].data).reverse().map(expense => {
                                if (expense.category === category) {
                                    return (
                                    <ListItem key={expense.date}>
                                        <ListItemIcon>
                                        {getCategoryIcon(expense.category)}
                                        </ListItemIcon>
                                        <ListItemText
                                        primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{formatAmount(expense.amount)} - USD {formatAmount(expense.amountUSD)}</Typography>}
                                        secondary={
                                            <div>
                                            <Typography variant="body1">{expense.subcategory}</Typography>
                                            <Typography variant="body1">{expense.description}</Typography>
                                            <Typography variant="body2" color="textSecondary">Fecha: {expense.date}</Typography>
                                            <Typography variant="body2" color="textSecondary">1 USD = {expense.valorUSD} ARS</Typography>
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
  );
};

export default SavingsList;
