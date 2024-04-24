import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button, ButtonGroup, TextField, Grid } from '@mui/material';
import { database } from '../firebase';
import { useNavigate } from 'react-router-dom';

const NewExpense = ({ uid,dolar }) => {
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

    database.ref(`${uid}/expenses/${year}/data/${month}/data`).push({
      amount: parseFloat(amount),
      amountUSD: parseFloat(amount/dolar['venta']),
      category: category,
      subcategory: subcategory,
      date: `${day}/${month}/${year}`,
      description: description,
      valorUSD: dolar['venta']
    }).then(() => {
      console.log('Expense sended')
    });

    // Actualizar totales mensuales y anuales en la base de datos para ingresos
    const yearlyRef = database.ref(`${uid}/expenses/${year}`);
    yearlyRef.transaction((data) => {
      if (data) {
        data.total = (data.total || 0) + parseFloat(amount);
        data.totalUSD = (data.totalUSD || 0) + parseFloat(amount/dolar['venta']);
      }
      return data;
    });

    const monthlyRef = database.ref(`${uid}/expenses/${year}/data/${month}`);
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

  // Define las subcategorías disponibles para cada categoría principal
  const subcategories = {
    Auto: ['Nafta', 'Gas', 'Mantenimiento'],
    Servicios: ['Electricidad', 'Expensas', 'Internet','Celular'],
    Indoor: ['Plantas', 'Fertilizantes','Tierra', 'Herramientas'],
    Supermercado: ['General', 'Chino', 'Verduleria','Carniceria'],
    Transporte: ['Uber', 'Publico'],
    Extras: ['Hierba', 'Otros'],
  };


  return (
    <Layout title="Nuevo Gasto">
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
          <Button variant="contained" type="submit" disabled={!amount || !category || !subcategory || !description}>Agregar Gasto</Button>
        </form>
      </Grid>
    </Layout>
  );
};

export default NewExpense;
