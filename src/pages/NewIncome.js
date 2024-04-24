import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button, TextField, Typography, ButtonGroup, Grid } from '@mui/material';
import { database } from '../firebase';
import { useNavigate } from 'react-router-dom';

const NewIncome = ({ uid,dolar }) => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');

  const handleFormSubmit = () => {
    if (!amount || !category || !subcategory || !description) {
      alert('Por favor complete todos los campos');
      return;
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    database.ref(`${uid}/incomes/${year}/data/${month}/data`).push({
      amount: parseFloat(amount),
      amountUSD: parseFloat(amount/dolar['venta']),
      category: category,
      subcategory: subcategory,
      date: `${day}/${month}/${year}`,
      description: description,
      valorUSD: dolar['venta']
    });

    // Actualizar totales mensuales y anuales en la base de datos para ingresos
    const yearlyRef = database.ref(`${uid}/incomes/${year}`);
    yearlyRef.transaction((data) => {
      if (data) {
        data.total = (data.total || 0) + parseFloat(amount);
        data.totalUSD = (data.totalUSD || 0) + parseFloat(amount/dolar['venta']);
      }
      return data;
    });

    const monthlyRef = database.ref(`${uid}/incomes/${year}/data/${month}`);
    monthlyRef.transaction((data) => {
      if (data) {
        data.total = (data.total || 0) + parseFloat(amount);
        data.totalUSD = (data.totalUSD || 0) + parseFloat(amount/dolar['venta']);
      }
      return data;
    });


    setAmount('');
    setCategory('');
    setSubcategory('');
    setDescription('');

    navigate('/finanzas');
  };

  const subcategories = {
    Sueldo: ['Sueldo Base', 'Bonificaciones', 'Comisiones'],
    Freelance: ['Web', 'Diseño', 'Otro Proyecto'],
    Camila: ['Sueldo Base', 'Comisiones', 'Extra'],
    Extras: ['Inversiones', 'Ventas', 'Otros'],
  };

  return (
    <Layout title="Nuevo Ingreso">
      <Grid item xs={12}>
        <ButtonGroup fullWidth>
          {Object.keys(subcategories).map((cat, index) => (
            <Button key={index} onClick={() => setCategory(cat)} variant={category === cat ? 'contained' : 'text'}>{cat}</Button>
          ))}
        </ButtonGroup>
      </Grid>
      <Grid item xs={12}>
        <ButtonGroup fullWidth>
          {category && subcategories[category].map((subcat, index) => (
            <Button key={index} onClick={() => setSubcategory(subcat)} variant={subcategory === subcat ? 'contained' : 'text'}>{subcat}</Button>
          ))}
        </ButtonGroup>
      </Grid>
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
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button variant="contained" type="submit" disabled={!amount || !category || !subcategory || !description}>Agregar Ingreso</Button>
        </form>
      </Grid>
    </Layout>
  );
};

export default NewIncome;
