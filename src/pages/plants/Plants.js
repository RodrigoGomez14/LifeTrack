import React from 'react';
import Layout from '../../components/layout/Layout';
import { Grid,Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Plants = () => {


  return (
    <Layout title='Plantas'>
      <Grid item xs={12}>
        <Link to="/NewPlant">
          <Button variant='contained'>NUEVA PLANTA</Button>
        </Link>
      </Grid>
    </Layout>
  );
};

export default Plants;
