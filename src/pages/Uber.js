import React, { useState} from 'react';
import Layout from '../components/Layout';
import { Typography, Grid, IconButton, Dialog, DialogTitle} from '@mui/material';
import { formatAmount } from '../utils';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { useStore } from '../store'; // Importar el store de Zustand
import CardChallengeUber from '../components/CardChallengeUber';
import CardPendingUber from '../components/CardPendingUber';
import UberMonthList from '../components/UberMonthList';

const Uber = () => {
  const {userData} = useStore(); // Obtener estados del store
  const [showDialog, setShowDialog] = useState(false);

  return (
    <Layout title="Uber">
      {!userData.uber?
        <>
          <div>No hay datos de Uber disponibles.</div>
          <Link to="/NewUberEntry">
            <IconButton aria-label="settings">
              <AddIcon />
            </IconButton>
          </Link>
        </>
        :
        <>
          <CardPendingUber setShowDialog={setShowDialog}/>
          <CardChallengeUber/>
          <UberMonthList data={userData.uber.data}/>
          <Dialog open={showDialog}>
            <DialogTitle>Fondo de mantenimiento del auto</DialogTitle>
            <Typography variant='body1'>{formatAmount(userData.uber.pending*userData.savings.carMaintenancePercentage)}</Typography>
          </Dialog>
        </>
      }
    </Layout>
  );
}; 

export default Uber;
