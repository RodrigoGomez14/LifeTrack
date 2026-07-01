import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import WithdrawFundWizard from '../../components/savings/WithdrawFundWizard';

const RetirarDeFondo = () => {
  const navigate = useNavigate();
  const { fundId } = useParams();
  const { userData } = useStore();

  const fund = useMemo(() => {
    if (!fundId || !userData?.savingsFunds?.[fundId]) return null;
    return { id: fundId, ...userData.savingsFunds[fundId] };
  }, [userData, fundId]);

  if (!fund) {
    return (
      <Layout title="Retirar" showBack onBack={() => navigate('/ahorros')}>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <Typography color="text.secondary">Fondo no encontrado</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={`Retirar de ${fund.name}`} showBack onBack={() => navigate('/ahorros')}>
      <WithdrawFundWizard
        fund={fund}
        onClose={() => navigate('/ahorros')}
        onSuccess={() => navigate('/ahorros')}
      />
    </Layout>
  );
};

export default RetirarDeFondo;
