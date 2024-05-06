import React from 'react';
import {Grid,Typography,} from '@mui/material';
import { formatAmount} from '../../utils';
import { Link } from 'react-router-dom';

const PlantIcon = ({plant,id}) => {
  return (
      <Grid item>
        <Link 
            to={{
                pathname:'/Plant',
                search:`${id}`
            }}
        >
          <Typography variant='h4'> {plant.name} </Typography>
        </Link>
      </Grid>
  );
};
export default PlantIcon;
