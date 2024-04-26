import React from 'react';
import {List,ListItem,ListItemIcon,ListItemText,Typography,} from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { formatAmount,formatMinutesToHours} from '../utils';

const UberEntry = ({data}) => {
  return (
    <List>
        {Object.keys(data).reverse().map(transactionId => {
            const transaction = data[transactionId];
            const coefficient = (transaction.amount / transaction.duration) * 60; // Calcular el coeficiente total/duración
            return (
                transaction.challenge?
                <ListItem key={transactionId}>
                    <ListItemIcon>
                        <DriveEtaIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{transaction.date} - Challenge</Typography>}
                        secondary={
                            <div>
                            <Typography variant="body1">
                                Monto: {`${formatAmount(transaction.amount)} - USD ${formatAmount(transaction.amountUSD)}`}
                            </Typography>
                            <Typography variant="body1">
                                1 USD = {formatAmount(transaction.valorUSD)} ARS
                            </Typography>
                            </div>
                        }
                    />
                </ListItem>
                :
                <ListItem key={transactionId}>
                    <ListItemIcon>
                        <DriveEtaIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{transaction.date}</Typography>}
                        secondary={
                            <div>
                            <Typography variant="body1">
                                Monto: {`${formatAmount(transaction.amount)} - USD ${formatAmount(transaction.amountUSD)}`}
                            </Typography>
                            <Typography variant="body1">
                                Efectivo: {formatAmount(transaction.cash)} - USD {formatAmount(transaction.cashUSD)}
                            </Typography>
                            <Typography variant="body1">
                                Duración: {formatMinutesToHours(transaction.duration)}
                            </Typography>
                            <Typography variant="body1">
                                Viajes: {transaction.travels}
                            </Typography>
                            <Typography variant="body1">
                                $/Hs: {formatAmount(coefficient)}/Hs - USD {formatAmount(coefficient / transaction.valorUSD)}/Hs
                            </Typography>
                            <Typography variant="body1">
                                1 USD = {formatAmount(transaction.valorUSD)} ARS
                            </Typography>
                            </div>
                        }
                    />
                </ListItem>
            );
        })}
    </List>
  );
};

export default UberEntry;
