import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateFundWizard from '../../components/savings/CreateFundWizard';

const CrearFondo = () => {
  const navigate = useNavigate();

  return (
    <CreateFundWizard
      onClose={() => navigate('/ahorros')}
      onSuccess={() => navigate('/ahorros')}
    />
  );
};

export default CrearFondo;
