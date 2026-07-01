import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Chip, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Layout from '../../components/layout/Layout';
import { AnimatedSuccess } from '../../design-system';

const COLOR = '#4CAF50';

const TestAnimation = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState(0);
  const replay = () => setKey((k) => k + 1);

  return (
    <Layout title="Test Animación">
      <AnimatedSuccess key={key} color={COLOR} title="¡Acción completada!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>Nombre de la planta</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Genética · 3 unidades</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
          <Chip label="Vegetativo" size="small" sx={{ fontWeight: 600, bgcolor: alpha(COLOR, 0.1), color: COLOR }} />
          <Chip label="10L" size="small" sx={{ fontWeight: 600 }} />
        </Box>
        <Button fullWidth variant="contained" size="large" onClick={replay}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: alpha(COLOR, 0.8) } }}>
          Repetir animación
        </Button>
        <Button onClick={() => navigate('/Home')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Home</Button>
      </AnimatedSuccess>
    </Layout>
  );
};

export default TestAnimation;
