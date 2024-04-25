import React from 'react';
import {Accordion,AccordionSummary,AccordionDetails,List,ListItem,ListItemIcon,ListItemText,Grid,Typography,} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName,formatMinutesToHours} from '../utils';
import DriveEtaIcon from '@mui/icons-material/DriveEta';

const TransactionsList = ({data,month}) => {


  return (
    <Grid item xs={8}>
        <Accordion key={month}>
            <AccordionSummary
            style={{ backgroundColor: '#263238', color: 'white' }}
            expandIcon={<ExpandMoreIcon />}
            >
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                {getMonthName(month)} - Total: {formatAmount(data.total)} - USD {formatAmount(data.totalUSD)}
            </Typography>
            </AccordionSummary>
            <AccordionDetails>
            <List>
                {Object.keys(data.data).reverse().map(transactionId => {
                const transaction = data.data[transactionId];
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
            </AccordionDetails>
        </Accordion>
        </Grid>
  );
};

export default TransactionsList;
