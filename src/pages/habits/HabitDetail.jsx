import React from 'react';
import Layout from '../../components/layout/Layout';
import HabitDetail from '../../components/habits/HabitDetail';
import { Box, Typography, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const HabitDetailPage = () => {
  const { habitId } = useParams();
  const navigate = useNavigate();

  // Función para volver a la página de hábitos
  const handleBack = () => {
    navigate('/Habitos');
  };

  // Si no se especificó un ID de hábito en la URL
  if (!habitId) {
    return (
      <Layout title="Detalles del Hábito">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
          p={3}
          textAlign="center"
        >
          <Typography variant="h6" color="error" gutterBottom>
            Error
          </Typography>
          <Typography variant="body1" gutterBottom>
            No se especificó un ID de hábito
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Volver a Hábitos
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Detalles del Hábito">
      <Box py={2}>
        <HabitDetail habitId={habitId} onBack={handleBack} />
      </Box>
    </Layout>
  );
};

export default HabitDetailPage;
