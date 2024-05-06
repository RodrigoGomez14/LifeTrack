import React, {useEffect, useState} from 'react';
import Layout from '../../components/layout/Layout';
import { Grid,Button, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import PlantsList from '../../components/plants/PlantsList'
import { useStore } from '../../store';
import { checkSearch } from '../../utils';
const PlantPage = () => {
  const { userData } = useStore()
  const location = useLocation()
  const [plant , setPlant] = useState(userData.plants.active[checkSearch(location.search)])

  useEffect(()=>{
    const id = checkSearch(location.search)
    setPlant(userData.plants.active[id])
  },[userData.plants])

  return (
    <Layout title={plant.name}>
        <Grid item xs={12}>
            <Typography variant='h3'>{plant.name}</Typography>
            <Typography variant='h6'>{plant.quantity} unidades</Typography>
        </Grid>
    </Layout>
  );
};

export default PlantPage;
