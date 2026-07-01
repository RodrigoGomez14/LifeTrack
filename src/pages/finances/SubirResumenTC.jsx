import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import Layout from '../../components/layout/Layout';
import TarjetasUploadWizard from '../../components/finances/TarjetasUploadWizard';

const SubirResumenTC = () => {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const [searchParams] = useSearchParams();

  const mes = searchParams.get('mes') || '';
  const anio = searchParams.get('anio') || '';
  const yearMonth = anio && mes ? `${anio}-${String(mes).padStart(2, '0')}` : '';

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showAlert = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleClose = () => navigate(`/tarjeta?id=${cardId}`);
  const handleSuccess = (msg) => {
    showAlert(msg, 'success');
    setTimeout(() => navigate(`/tarjeta?id=${cardId}`), 800);
  };

  return (
    <Layout title="Subir resumen" showBack onBack={() => navigate(`/tarjeta?id=${cardId}`)}>
      <TarjetasUploadWizard
        cardId={cardId}
        yearMonth={yearMonth}
        selectedMonth={mes ? parseInt(mes) : new Date().getMonth() + 1}
        selectedYear={anio ? parseInt(anio) : new Date().getFullYear()}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}
          variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
};

export default SubirResumenTC;
