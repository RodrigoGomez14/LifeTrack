import React from 'react';
import {List,ListItem,ListItemIcon,ListItemText,Typography,Grid} from '@mui/material';
import { formatAmount,getCategoryIcon } from '../../utils';

const ActionsTabsList = ({ data,type }) => {
  return (
    <List>
        {data?
            Object.values(data).reverse().map(action => {
                return (
                    <ListItem key={action.date}>
                        <ListItemText
                            primary={action.quantity}
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
            })
            :
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant='h4'> No se registraron {type}</Typography>
                </Grid>
            </Grid>
        }
    </List>
  );
};

export default ActionsTabsList;
