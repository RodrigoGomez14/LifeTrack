import React from 'react';
import Layout from '../../components/layout/Layout';
import { Grid,Button,Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import  PlantIcon  from '../../components/plants/PlantIcon'

const PlantsList = () => {
  const { userData } = useStore()

  return (
    <Layout title='Plantas'>
      <Grid item xs={12}>
        <Link to="/NuevaPlanta">
          <Button variant='contained'>NUEVA PLANTA</Button>
        </Link>
      </Grid>
      {userData.plants?
        <Grid container item xs={12} justifyContent='center' spacing={3}>
              <Grid item xs={12} >
                  <Typography variant="h6" align="center">Plantas Activas</Typography>
              </Grid>
              <Grid container justifyContent='center' spacing={3}>
                {Object.keys(userData.plants.active).reverse().map(plantActive => (
                    <PlantIcon plant={userData.plants.active[plantActive]} id={plantActive}/>
                ))}
              </Grid>
          </Grid>
          :
          null  
      }
    </Layout>
  );
};

export default PlantsList;
