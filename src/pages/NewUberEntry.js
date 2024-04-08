import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button, TextField, Typography, InputAdornment, IconButton, Input, InputLabel, FormControl, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { database } from '../firebase';
import { useNavigate } from 'react-router-dom';

const NewUberEntryPage = ({ uid, pending, dolar }) => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [cash, setCash] = useState('');
  const [tips, setTips] = useState(''); // Estado para almacenar las propinas
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [totalCash, setTotalCash] = useState(0);
  const [totalTips, setTotalTips] = useState(0); // Estado para almacenar el total de propinas

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

    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0')

    database.ref(`${uid}/uber/data/${year}/${month}`).push({
      date: `${day}/${month}/${year}`,
      amount: parseFloat(amount),
      cash: parseFloat(totalCash),
      tips: parseFloat(totalTips), // Agregar las propinas
      duration: totalMinutes,
      valorUSD: dolar['venta']
    });

    database.ref(`${uid}/uber/pending`).set(pending + (parseFloat(amount) - parseFloat(totalCash)));

    database.ref(`${uid}/incomes/${year}/${month}`).push({
      date: `${day}/${month}/${year}`,
      amount: parseFloat(totalCash),
      category: 'Uber',
      subCategory: 'Efectivo Uber',
      description: 'Efectivo Uber',
      valorUSD: dolar['venta']
    });

    // Guardar las propinas como un ingreso adicional
    if(tips>0){
      database.ref(`${uid}/incomes/${year}/${month}`).push({
        date: `${day}/${month}/${year}`,
        amount: parseFloat(totalTips),
        category: 'Uber',
        subCategory: 'Propinas Uber',
        description: 'Propinas Uber',
        valorUSD: dolar['venta']
      });
    }

    setAmount('');
    setCash('');
    setTips('');
    setHours('');
    setMinutes('');

    navigate('/uber');
  };

  return (
    <Layout title="Finalizar Jornada Uber">
      <Grid container justifyContent='center'>
        <Grid item xs={6}>
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
                      aria-label="toggle password visibility"
                      onClick={handleAddCash}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <Typography variant="body1" gutterBottom>
              Total en Efectivo: {totalCash}
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
              Total de Propinas: {totalTips}
            </Typography>
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
      </Grid>
    </Layout>
  );
};

export default NewUberEntryPage;
