import React from 'react';
import Layout from '../../components/layout/Layout';
import HabitDetail from '../../components/habits/HabitDetail';
import { Box, Typography, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const HabitDetailPage = () => {
  const { habitId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => navigate('/Habitos');

  // Si no se especificó un ID de hábito en la URL
  if (!habitId) {
    return (
      <Layout title="Detalle del Hábito" showBack onBack={handleBack}>
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, py: 8, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Hábito no encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No se especificó un ID de hábito.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}
          >
            Volver a Hábitos
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Detalle del Hábito" showBack onBack={handleBack}>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, pb: 8 }}>
        <HabitDetail habitId={habitId} />
      </Box>
    </Layout>
  );
};

export default HabitDetailPage;
