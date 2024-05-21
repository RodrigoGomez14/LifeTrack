import React from 'react';
import {Accordion,AccordionSummary,AccordionDetails,Grid,Typography,} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatAmount, getMonthName} from '../../utils';
import UberEntry from './UberEntry';
import { useTheme } from '@mui/material/styles';

const UberMonth = ({data,month}) => {
    const theme = useTheme();
    return (
        data.data.length?
            <Grid item>
                <Accordion key={month}>
                    <AccordionSummary
                        style={{ backgroundColor: theme.palette.secondary.main, color: 'white' }}
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}> {getMonthName(month)} - Total: {formatAmount(data.total)} - USD {formatAmount(data.totalUSD)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <UberEntry data={data.data}/>
                    </AccordionDetails>
                </Accordion>
            </Grid>
            :
            null
        );
};

export default UberMonth;
