import React, {useEffect, useState} from 'react';
import Layout from '../../components/layout/Layout';
import { Grid,Button, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { checkSearch } from '../../utils';
import { database,auth } from '../../firebase';

const PlantPage = () => {
  const { userData } = useStore()
  const location = useLocation()
  const [plant , setPlant] = useState(userData.plants.active[checkSearch(location.search)])

  useEffect(()=>{
    const id = checkSearch(location.search)
    setPlant(userData.plants.active[id])
  },[userData.plants])

  const newRiego = () => {
    database.ref(`${auth.currentUser.uid}/plants/active/${checkSearch(location.search)}/riegos`).push({
      quantity:200,
      medida:'ml',
      fertilizantes:false,
    });
  };
  return (
    <Layout title={plant.name}>
        <Grid item xs={12}>
            <Typography variant='h3'>{plant.name}</Typography>
            <Typography variant='h6'>{plant.quantity} unidades</Typography>
        </Grid>
        <Grid container item justifyContent='center' spacing={3}>
          <Grid item>
            <Button variant='contained' onClick={newRiego}>RIEGO</Button>
          </Grid>
          <Grid item>
            <Button variant='contained'>TRANSPLANTE</Button>
          </Grid>
          <Grid item>
            <Button variant='contained'>PODA</Button>
          </Grid>
        </Grid>
    </Layout>
  );
};

export default PlantPage;
