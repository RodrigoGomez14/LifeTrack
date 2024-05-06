import React from 'react';
import {Grid,Typography,} from '@mui/material';
import { formatAmount} from '../../utils';
import PlantIcon from './PlantIcon';

const PlantsList = ({data}) => {
  return (
      <Grid container item xs={12} justifyContent='center' spacing={2}>
          <Grid item xs={12} >
              <Typography variant="h6" align="center">Plantas Activas</Typography>
          </Grid>
          <Grid container item>
            {Object.keys(data.active).reverse().map(plantActive => (
                <PlantIcon plant={data.active[plantActive]} id={plantActive}/>
            ))}
          </Grid>
      </Grid>
  );
};

export default PlantsList;
