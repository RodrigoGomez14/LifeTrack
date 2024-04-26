import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button, TextField, Typography, InputAdornment, IconButton, Input, InputLabel, FormControl, Grid,Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { database,auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../utils';
import { useStore } from '../store'; 

const NewUberEntryPage = () => {
  const {userData,dollarRate} = useStore();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [cash, setCash] = useState('');
  const [tips, setTips] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [travels, setTravels] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [totalTips, setTotalTips] = useState(0);

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

    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    database.ref(`${auth.currentUser.uid}/uber/data/${year}/data/${month}/data`).push({
      date: `${day}/${month}/${year}`,
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

    // Actualizar totales mensuales en la base de datos para Uber
    const monthlyUberRef = database.ref(`${auth.currentUser.uid}/uber/data/${year}/data/${month}`);
    monthlyUberRef.transaction((data) => {
      if (data) {
        data.total = (data.total || 0) + amountValue;
        data.totalUSD = (data.totalUSD || 0) + amountUSDValue;
      }
      return data;
    });

    // Actualizar totales anuales en la base de datos para Uber
    const yearlyUberRef = database.ref(`${auth.currentUser.uid}/uber/data/${year}`);
    yearlyUberRef.transaction((data) => {
      if (data) {
        data.total = (data.total || 0) + amountValue;
        data.totalUSD = (data.totalUSD || 0) + amountUSDValue;
      }
      return data;
    });
    
    // Agregar el ingreso de efectivo a la base de datos para ingresos
    database.ref(`${auth.currentUser.uid}/incomes/${year}/data/${month}/data`).push({
      date: `${day}/${month}/${year}`,
      amount: totalCashValue,
      amountUSD: totalCashUSDValue,
      category: 'Uber',
      subCategory: 'Efectivo Uber',
      description: 'Efectivo Uber',
      valorUSD: dollarRate['venta']
    });
    
    if (totalTipsValue > 0) {
      // Agregar el ingreso de propinas a la base de datos para ingresos
      database.ref(`${auth.currentUser.uid}/incomes/${year}/data/${month}/data`).push({
        date: `${day}/${month}/${year}`,
        amountUSD: totalTipsUSDValue,
        amount: totalTipsValue,
        category: 'Uber',
        subCategory: 'Propinas Uber',
        description: 'Propinas Uber',
        valorUSD: dollarRate['venta']
      });
    }

    // Actualizar totales mensuales y anuales en la base de datos para ingresos
    const monthlyRef = database.ref(`${auth.currentUser.uid}/incomes/${year}/data/${month}`);
    monthlyRef.transaction((data) => {
      if (data) {
        data.total = (data.total || 0) + totalCashValue;
        data.totalUSD = (data.totalUSD || 0) + totalCashUSDValue;
      }
      return data;
    });

    const yearlyRef = database.ref(`${auth.currentUser.uid}/incomes/${year}`);
    yearlyRef.transaction((data) => {
      if (data) {
        data.total = (data.total || 0) + totalCashValue;
        data.totalUSD = (data.totalUSD || 0) + totalCashUSDValue;
      }
      return data;
    });

    database.ref(`${auth.currentUser.uid}/uber/pending`).set(userData.uber.pending + amountValue - totalCashValue);
    database.ref(`${auth.currentUser.uid}/savings/carMaintenance`).set(userData.savings.carMaintenance + parseFloat(totalCashValue*userData.savings.carMaintenancePercentage));

    // Agregar el ingreso de efectivo a la base de datos para ingresos
    database.ref(`${auth.currentUser.uid}/savings/carMaintenanceHistory`).push({
      date: `${day}/${month}/${year}`,
      amount: parseFloat(totalCashValue*userData.savings.carMaintenancePercentage),
      amountUSD: parseFloat(totalCashValue*userData.savings.carMaintenancePercentage)/dollarRate['venta'],
      newTotal: userData.savings.carMaintenance+parseFloat(totalCashValue*userData.savings.carMaintenancePercentage),
      newTotalUSD: (userData.savings.carMaintenance/dollarRate['venta'])+(parseFloat(totalCashValue*userData.savings.carMaintenancePercentage)/dollarRate['venta'])
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
        <form onSubmit={handleFormSubmit}>
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
          <Button variant="contained" type="submit">Finalizar Jornada</Button>
        </form>
      </Grid>
      <Grid container item xs={12} justifyContent='center'>
        <Alert severity="success" variant='filled'>
          FONDO DE MANTENIMIENTO DEL AUTO : {formatAmount(parseFloat(totalCash*userData.savings.carMaintenancePercentage))}
        </Alert>
      </Grid>
    </Layout>
  );
};

export default NewUberEntryPage;
