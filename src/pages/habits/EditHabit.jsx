import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import HabitForm from '../../components/habits/HabitForm';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

const EditHabit = () => {
  const { userData } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extraer el ID del hábito de la URL
  const getHabitId = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('id');
  };
  
  useEffect(() => {
    const habitId = getHabitId();
    
    if (!habitId) {
      setError('No se especificó un ID de hábito');
      setLoading(false);
      return;
    }
    
    if (userData && userData.habits) {
      // Buscar el hábito por ID
      const foundHabit = userData.habits[habitId];
      
      if (foundHabit) {
        // Agregar el ID al objeto del hábito para referencia
        setHabit({ ...foundHabit, id: habitId });
        setLoading(false);
      } else {
        setError('No se encontró el hábito especificado');
        setLoading(false);
      }
    } else {
      setError('No hay datos de hábitos disponibles');
      setLoading(false);
    }
  }, [userData, location]);
  
  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <Layout title="Editar Hábito">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <Layout title="Editar Hábito">
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
          <Typography variant="body1">
            {error}
          </Typography>
          <Box mt={2}>
            <Typography 
              variant="body2" 
              color="primary" 
              onClick={() => navigate('/Habitos')}
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Volver a Hábitos
            </Typography>
          </Box>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout title="Editar Hábito">
      <Box py={2}>
        <HabitForm habit={habit} isEditing={true} />
      </Box>
    </Layout>
  );
};

export default EditHabit; 