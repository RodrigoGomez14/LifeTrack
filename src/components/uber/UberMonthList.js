import React from 'react';
import {Grid,Typography,} from '@mui/material';
import { formatAmount} from '../../utils';
import UberMonth from './UberMonth'

const UberMonthList = ({data}) => {
  return (
    Object.keys(data).map(year => (
        <Grid container item xs={12} key={year} justifyContent='center' spacing={2}>
            <Grid item xs={12} >
                <Typography variant="h6" align="center">{year} - Total: {formatAmount(data[year].total)} - USD {formatAmount(data[year].totalUSD)}</Typography>
            </Grid>
            {Object.keys(data[year].months).reverse().map(month => (
                <UberMonth data={data[year].months[month]} month={month}/>
            ))}
        </Grid>
    ))
  );
};

export default UberMonthList;
