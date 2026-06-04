import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

// Redirige al nuevo formulario unificado de medición y riego.
const NewIrrigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    navigate(`/Registrar${location.search}`, { replace: true });
  }, [navigate, location.search]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">Abriendo formulario de medición...</Typography>
    </Box>
  );
};

export default NewIrrigation;
