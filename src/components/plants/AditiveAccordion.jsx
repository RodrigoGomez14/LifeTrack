import React from 'react';
import { Chip, Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText,Grid,Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';

const AditiveAccordion = ({ aditive }) => {
  const theme = useTheme();
  return (
    <Accordion>
    <AccordionSummary
        style={{backgroundColor:theme.palette.secondary.main,color:theme.palette.primary.contrastText}}
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${aditive.name}-content`}
        id={`panel-${aditive.name}-header`}
    >
        <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{aditive.name}  <Chip label={aditive.brand} /></Typography>
    </AccordionSummary>
    <AccordionDetails>
        <Grid container justifyContent='center'>
            <Grid item xs={6}>
                <Paper elevation={6}>
                    <List>
                        <ListItem>
                            <Typography variant="subtitle1">Dosis:</Typography>
                        </ListItem>
                        {aditive.dosis?.map((dose, index) => (
                            <ListItem key={index}>
                            <ListItemText
                                primary={dose.name}
                                secondary={`Cantidad: ${dose.quantity} ${dose.measure}`}
                            />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>
        </Grid>
    </AccordionDetails>
    </Accordion>
  );
};

export default AditiveAccordion;
