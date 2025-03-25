import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import HabitDetail from '../../components/habits/HabitDetail';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const HabitDetailPage = () => {
  const { userData } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [habitId, setHabitId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Extraer el ID del hábito de la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    
    if (id) {
      setHabitId(id);
    }
    
    setLoading(false);
  }, [location]);
  
  // Función para volver a la página de hábitos
  const handleBack = () => {
    navigate('/Habitos');
  };
  
  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <Layout title="Detalles del Hábito">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  // Si no se especificó un ID de hábito
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