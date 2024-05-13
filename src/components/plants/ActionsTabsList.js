import React from 'react';
import {List,ListItem,ListItemIcon,ListItemText,Typography,Grid} from '@mui/material';
import { convertToDetailedDate, formatAmount,getCategoryIcon } from '../../utils';

const ActionsTabsList = ({ data,type }) => {
  return (
    <>
        <List>
            {data?
                Object.values(data).reverse().map(action => {
                    switch (type) {
                        case 'riegos':
                            return (
                                <ListItem key={action.date}>
                                    <ListItemText
                                        primary={convertToDetailedDate(action.date)}
                                        secondary={
                                            <div>
                                                <Typography variant="body1">{action.quantity}{action.measure}</Typography>
                                                <Typography variant="body1">{action.fertilizantes?'fertilizantes':'no hay fertilizantes'}</Typography>
                                            </div>
                                        }
                                    />
                                </ListItem>
                                );
                            break;
                        case 'insecticidas':
                            return (
                                <ListItem key={action.date}>
                                    <ListItemText
                                        primary={convertToDetailedDate(action.date)}
                                        secondary={
                                            <div>
                                                <Typography variant="body1">{action.product}</Typography>
                                                <Typography variant="body1">{action.appMethod}</Typography>
                                            </div>
                                        }
                                    />
                                </ListItem>
                                );
                            break;
                        case 'podas':
                            return (
                                <ListItem key={action.date}>
                                    <ListItemText
                                        primary={convertToDetailedDate(action.date)}
                                        secondary={
                                            <div>
                                                <Typography variant="body1">{action.type}</Typography>
                                            </div>
                                        }
                                    />
                                </ListItem>
                                );
                            break;
                        case 'transplantes':
                            return (
                                <ListItem key={action.date}>
                                    <ListItemText
                                        primary={convertToDetailedDate(action.date)}
                                        secondary={
                                            <div>
                                                <Typography variant="body1">Maceta Anterior: {action.previousPot}</Typography>
                                                <Typography variant="body1">Maceta Nueva: {action.newPot}</Typography>
                                            </div>
                                        }
                                    />
                                </ListItem>
                                );
                            break;
                    
                        default:
                            break;
                    }
                })
                :
                <Grid container>
                    <Grid item xs={12}>
                        <Typography variant='h4'> No se registraron {type}</Typography>
                    </Grid>
                </Grid>
            }
        </List>
    </>
  );
};

export default ActionsTabsList;
