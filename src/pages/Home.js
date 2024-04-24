import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { database } from '../firebase';
import { Typography, Grid, Card, CardContent, Button,CardHeader } from '@mui/material';
import Layout from '../components/Layout';
import { formatAmount } from '../formattingUtils';

const Home = ({carMaintenance}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [uberData, setUberData] = useState(null);
  const [finanzasData, setFinanzasData] = useState(null);

  useEffect(() => {
    const fetchUberData = async () => {
      // Lógica para obtener los datos de Uber desde Firebase
      try {
        const uberSnapshot = await database.ref('uber').once('value');
        const uberData = uberSnapshot.val();
        setUberData(uberData);
      } catch (error) {
        console.error('Error fetching Uber data:', error);
      }
    };

    const fetchFinanzasData = async () => {
      // Lógica para obtener los datos de Finanzas desde Firebase
      try {
        const finanzasSnapshot = await database.ref('finanzas').once('value');
        const finanzasData = finanzasSnapshot.val();
        setFinanzasData(finanzasData);
      } catch (error) {
        console.error('Error fetching Finanzas data:', error);
      }
    };

    fetchUberData();
    fetchFinanzasData();
  }, []);

  // Funciones para calcular estadísticas
  const calculateUberTotal = () => {
    // Lógica para calcular el total de Uber
    if (!uberData) return 0;

    let total = 0;
    // Lógica para calcular el total
    return total;
  };

  const calculateFinanzasTotal = () => {
    // Lógica para calcular el total de Finanzas
    if (!finanzasData) return 0;

    let total = 0;
    // Lógica para calcular el total
    return total;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Aquí puedes realizar acciones adicionales al cambiar la fecha seleccionada
  };

  return (
    <Layout title="Home">
      <div>
        <Grid container spacing={3}>
          <Grid container justifyContent='center'>
              <Card>
                  <CardHeader
                    title='Mantenimiento Auto'
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h2" align="center">{formatAmount(carMaintenance)}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
            </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Estadísticas de Uber
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Total: {formatAmount(calculateUberTotal())}
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
                  Total: {formatAmount(calculateFinanzasTotal())}
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
        </Grid>
      </div>
    </Layout>
  );
};

export default Home;
