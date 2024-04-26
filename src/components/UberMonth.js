import React from 'react';
import {Accordion,AccordionSummary,AccordionDetails,Grid,Typography,} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName,formatMinutesToHours} from '../utils';
import UberEntry from './UberEntry';

const UberMonth = ({data,month}) => {


  return (
    <Grid item xs={8}>
        <Accordion key={month}>
            <AccordionSummary
                style={{ backgroundColor: '#263238', color: 'white' }}
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}> {getMonthName(month)} - Total: {formatAmount(data.total)} - USD {formatAmount(data.totalUSD)}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <UberEntry data={data.data}/>
            </AccordionDetails>
        </Accordion>
    </Grid>
  );
};

export default UberMonth;
