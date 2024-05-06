import React from 'react';
import Layout from '../../components/layout/Layout';
import { Grid,Button } from '@mui/material';
import { Link } from 'react-router-dom';
import PlantsList from '../../components/plants/PlantsList'
import { useStore } from '../../store';

const Plants = () => {
  const { userData } = useStore()

  return (
    <Layout title='Plantas'>
      <Grid item xs={12}>
        <Link to="/NewPlant">
          <Button variant='contained'>NUEVA PLANTA</Button>
        </Link>
      </Grid>
      <PlantsList data={userData.plants}/>
    </Layout>
  );
};

export default Plants;
