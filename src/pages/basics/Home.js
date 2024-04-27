import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Grid, Card, CardContent, Button,CardHeader } from '@mui/material';
import Layout from '../../components/layout/Layout';
import { formatAmount } from '../../utils';
import { useStore } from '../../store'; // Importar el store de Zustand

const Home = () => {
  const {userData } = useStore();
  return (
    <Layout title="Home">
      <Grid container item justifyContent='center'>
        <Grid item>
          <Card>
              <CardHeader
                title='Mantenimiento Auto'
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h2" align="center">{formatAmount(userData.savings.carMaintenance)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
        </Grid>
        <Grid item>
          <Card>
              <CardHeader
                title='ahorros USD'
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h2" align="center">{formatAmount(userData.savings.amountUSD)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Estadísticas de Uber
            </Typography>
            <Typography variant="body1" gutterBottom>
              Total: {formatAmount(0)}
            </Typography>
            {/* Otras estadísticas de Uber */}
            <Link to="/uber">
              <Button variant="contained" color="primary">
                Ver Detalles
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Estadísticas Financieras
            </Typography>
            <Typography variant="body1" gutterBottom>
              Total: {formatAmount(0)}
            </Typography>
            {/* Otras estadísticas financieras */}
            <Link to="/finanzas">
              <Button variant="contained" color="primary">
                Ver Detalles
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Calendario
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Layout>
  );
};

export default Home;
