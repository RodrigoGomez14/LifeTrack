import React from 'react';
import {Grid,Typography,Button} from '@mui/material';
import { formatAmount} from '../../utils';
import { Link } from 'react-router-dom';

const PlantIcon = ({plant,id}) => {
  return (
      <Grid item>
        <Link 
            to={{
                pathname:'/Planta',
                search:`${id}`
            }}
        >
          <Button variant='contained'> {plant.name} </Button>
        </Link>
      </Grid>
  );
};
export default PlantIcon;
