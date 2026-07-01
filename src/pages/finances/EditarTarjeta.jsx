import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Snackbar, Alert, Box } from '@mui/material';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import TarjetasAddEditSheet from '../../components/finances/TarjetasAddEditSheet';

const EditarTarjeta = () => {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const { userData } = useStore();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showAlert = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const card = useMemo(() => {
    if (!cardId || !userData?.creditCards?.[cardId]) return null;
    const c = userData.creditCards[cardId];
    if (c.name === undefined) return null;
    return { id: cardId, ...c };
  }, [userData, cardId]);

  if (!card) {
    return (
      <Layout title="Editar tarjeta" showBack onBack={() => navigate('/tarjetas')}>
        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity="error"
            variant="filled" sx={{ width: '100%', borderRadius: 2 }}>Tarjeta no encontrada</Alert>
        </Snackbar>
      </Layout>
    );
  }

  const backUrl = `/tarjeta?id=${cardId}`;

  return (
    <Layout title="Editar tarjeta" showBack onBack={() => navigate(backUrl)}>
      <Box sx={{ maxWidth: 480, mx: 'auto', pt: 2 }}>
        <TarjetasAddEditSheet
          onBack={() => navigate(backUrl)}
          editCard={card}
          onSuccess={(msg) => { showAlert(msg, 'success'); setTimeout(() => navigate(backUrl), 600); }}
          onError={(msg) => showAlert(msg, 'error')}
        />
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}
          variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
};

export default EditarTarjeta;
