import React from 'react';
import {List,ListItem,ListItemIcon,ListItemText,Typography} from '@mui/material';
import { formatAmount,getCategoryIcon } from '../../utils';

const ActionsTabsList = ({ data }) => {
  return (
    <List>
        {Object.values(data).reverse().map(action => {
            return (
                <ListItem key={action.date}>
                    <ListItemIcon>
                    {console.log(data)}
                    </ListItemIcon>
                    <ListItemText
                        primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{formatAmount(action.amount)} - USD {formatAmount(action.amountUSD)}</Typography>}
                        secondary={
                            <div>
                                <Typography variant="body1">{action.subcategory}</Typography>
                                <Typography variant="body1">{action.description}</Typography>
                                <Typography variant="body2" color="textSecondary">Fecha: {action.date}</Typography>
                                <Typography variant="body2" color="textSecondary">1 USD = {action.valorUSD} ARS</Typography>
                            </div>
                        }
                    />
                </ListItem>
                );
        })}
    </List>
  );
};

export default ActionsTabsList;
