import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button, TextField, Typography, InputAdornment, IconButton, Input, InputLabel, FormControl, Grid,Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { database,auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../../utils';
import { useStore } from '../../store'; 
import { getDate } from '../../utils'

const NewUberEntryPage = () => {
  const {userData,dollarRate} = useStore();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [cash, setCash] = useState('');
  const [tips, setTips] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [travels, setTravels] = useState('');
  const [totalCash, setTotalCash] = useState(0);
  const [totalTips, setTotalTips] = useState(0);
  const [carMaintenanceAmount, setCarMaintenanceAmount] = useState('');

  const handleCashInputChange = (e) => {
    setCash(e.target.value);
  };

  const handleTipsInputChange = (e) => {
    setTips(e.target.value);
  };

  const handleAddCash = () => {
    const cashValue = parseFloat(cash);
    if (!isNaN(cashValue)) {
      setTotalCash(prevTotalCash => prevTotalCash + cashValue);
      setCash('');
    }
  };

  const handleAddTips = () => {
    const tipsValue = parseFloat(tips);
    if (!isNaN(tipsValue)) {
      setTotalTips(prevTotalTips => prevTotalTips + tipsValue);
      setTips('');
    }
  };

  const handleFormSubmit = () => {
    if (!amount || !hours || !minutes) {
      alert('Por favor complete todos los campos');
      return;
    }

    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const amountValue = parseFloat(amount);
    const totalCashValue = parseFloat(totalCash);
    const totalTipsValue = parseFloat(totalTips);
    const amountUSDValue = amountValue / dollarRate['venta'];
    const totalCashUSDValue = totalCashValue / dollarRate['venta'];
    const totalTipsUSDValue = totalTipsValue / dollarRate['venta'];

    database.ref(`${auth.currentUser.uid}/uber/data`).push({
      date: getDate(),
      amount: amountValue,
      amountUSD: amountUSDValue,
      cash: totalCashValue,
      cashUSD: totalCashUSDValue,
      tips: totalTipsValue,
      tipsUSD: totalTipsUSDValue,
      duration: totalMinutes,
      travels: parseInt(travels),
      valorUSD: dollarRate['venta']
    });
    
    // Actualiza la cantidad de viajes de los challenge
    const challengeRef = database.ref(`${auth.currentUser.uid}/uber/challenge`);
    challengeRef.transaction((data) => {
      if (data) {
        data.progress = (data.progress || 0) + parseInt(travels);
      }
      return data;
    });

    
    // Agregar el ingreso de efectivo a la base de datos para ingresos
    database.ref(`${auth.currentUser.uid}/incomes`).push({
      date: getDate(),
      amount: totalCashValue,
      amountUSD: totalCashUSDValue,
      category: 'Uber',
      subCategory: 'Efectivo Uber',
      description: 'Efectivo Uber',
      valorUSD: dollarRate['venta']
    });
    
    if (totalTipsValue > 0) {
      // Agregar el ingreso de propinas a la base de datos para ingresos
      database.ref(`${auth.currentUser.uid}/incomes`).push({
        date: getDate(),
        amountUSD: totalTipsUSDValue,
        amount: totalTipsValue,
        category: 'Uber',
        subCategory: 'Propinas Uber',
        description: 'Propinas Uber',
        valorUSD: dollarRate['venta']
      });
    }


    database.ref(`${auth.currentUser.uid}/uber/pending`).set(userData.uber.pending + amountValue - totalCashValue);
    database.ref(`${auth.currentUser.uid}/savings/carMaintenance`).set(userData.savings.carMaintenance + parseInt(carMaintenanceAmount));

    // Agregar el ingreso de efectivo a la base de datos para ingresos
    database.ref(`${auth.currentUser.uid}/savings/carMaintenanceHistory`).push({
      date: getDate(),
      amount: parseInt(carMaintenanceAmount),
      amountUSD: parseFloat(carMaintenanceAmount)/dollarRate['venta'],
      newTotal: userData.savings.carMaintenance+parseInt(carMaintenanceAmount),
      newTotalUSD: (userData.savings.carMaintenance/dollarRate['venta'])+(parseFloat(carMaintenanceAmount)/dollarRate['venta'])
    });

    setAmount('');
    setCash('');
    setTips('');
    setHours('');
    setMinutes('');

    navigate('/uber');
  };

  return (
    <Layout title="Finalizar Jornada Uber">
      <Grid container item xs={12} justifyContent='center'>
          <TextField
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth>
            <InputLabel htmlFor="efectivo">Efectivo</InputLabel>
            <Input
              id='efectivo'
              label="Efectivo"
              type="number"
              value={cash}
              onChange={handleCashInputChange}
              margin="normal"
              startAdornment={
                <InputAdornment position="start">
                  <IconButton
                    onClick={handleAddCash}
                  >
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Typography variant="body1" gutterBottom>
            Total en Efectivo: {formatAmount(totalCash)}
          </Typography>
          <FormControl fullWidth>
            <InputLabel htmlFor="propinas">Propinas</InputLabel>
            <Input
              id='propinas'
              label="Propinas"
              type="number"
              value={tips}
              onChange={handleTipsInputChange}
              margin="normal"
              startAdornment={
                <InputAdornment position="start">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleAddTips}
                  >
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Typography variant="body1" gutterBottom>
            Total de Propinas: {formatAmount(totalTips)}
          </Typography>
          <TextField
            label="Cantidad de Viajes"
            type="number"
            value={travels}
            onChange={(e) => setTravels(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Horas"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Minutos"
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleFormSubmit}>Finalizar Jornada</Button>
      </Grid>
      <Grid container item xs={12} justifyContent='center'>
        <Alert severity="success" variant='filled'>
          FONDO DE MANTENIMIENTO DEL AUTO : 
          <TextField
            label="Mantenimiento"
            type="number"
            placeholder={totalCash*userData.savings.carMaintenancePercentage}
            value={carMaintenanceAmount}
            onChange={(e) => setCarMaintenanceAmount(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Alert>
      </Grid>
    </Layout>
  );
};

export default NewUberEntryPage;
