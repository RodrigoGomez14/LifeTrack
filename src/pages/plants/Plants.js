import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Typography, Grid, IconButton, Dialog, DialogTitle, Button } from '@mui/material';
import { formatAmount, formatMinutesToHours, getMonthName } from '../../utils';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { useStore } from '../../store';
import CardChallengeUber from '../../components/uber/CardChallengeUber';
import CardPendingUber from '../../components/uber/CardPendingUber';
import CardTotalWeeklyUber from '../../components/uber/CardTotalWeeklyUber';
import CardTotalGasExpenses from '../../components/uber/CardTotalGasExpenses';
import CardTotalMonthlyUber from '../../components/uber/CardTotalMonthlyUber';
import CardAverageDailyUber from '../../components/uber/CardAverageDailyUber';
import UberMonthList from '../../components/uber/UberMonthList';
import ReactApexChart from 'react-apexcharts';

const Plants = () => {
  const { userData } = useStore(); // Obtener estados del store
  const [showDialog, setShowDialog] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;


  return (
    <Layout title="Plantas">
      {!userData.plantas ? (
        <>
          <div>No hay plantas disponibles.</div>
          <Link to="/NewPlant">
            <IconButton aria-label="settings">
              <AddIcon />
            </IconButton>
          </Link>
        </>
      ) : (
        <>
          <Grid container spacing={2} justifyContent="center">
          </Grid>
        </>
      )}
    </Layout>
  );
};

export default Plants;
