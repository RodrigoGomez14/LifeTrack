import React from 'react';
import {List,ListItem,ListItemIcon,ListItemText,Typography} from '@mui/material';
import { formatAmount,getCategoryIcon } from '../utils';

const TransactionsTabsList = ({ data,category }) => {
  return (
    <List>
        {Object.values(data).reverse().map(transaction => {
            if (transaction.category === category) {
                return (
                    <ListItem key={transaction.date}>
                        <ListItemIcon>
                            {getCategoryIcon(transaction.category)}
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{formatAmount(transaction.amount)} - USD {formatAmount(transaction.amountUSD)}</Typography>}
                            secondary={
                                <div>
                                    <Typography variant="body1">{transaction.subcategory}</Typography>
                                    <Typography variant="body1">{transaction.description}</Typography>
                                    <Typography variant="body2" color="textSecondary">Fecha: {transaction.date}</Typography>
                                    <Typography variant="body2" color="textSecondary">1 USD = {transaction.valorUSD} ARS</Typography>
                                </div>
                            }
                        />
                    </ListItem>
                );
            }
            return null;
        })}
    </List>
  );
};

export default TransactionsTabsList;
