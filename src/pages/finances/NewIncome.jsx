import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button, TextField, ButtonGroup, Grid } from '@mui/material';
import { database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; 
import { useStore } from '../../store'; 
import { getDate } from '../../utils'

const NewIncome = () => {
  const { dollarRate} = useStore();
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


    database.ref(`${auth.currentUser.uid}/incomes`).push({
      amount: parseFloat(amount),
      amountUSD: parseFloat(amount/dollarRate['venta']),
      category: category,
      subcategory: subcategory,
      date: getDate(),
      description: description,
      valorUSD: dollarRate['venta']
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
      {!category?
        null
        :
        <Grid item xs={12}>
          <ButtonGroup fullWidth>
            {category && subcategories[category].map((subcat, index) => (
              <Button key={index} onClick={() => setSubcategory(subcat)} variant={subcategory === subcat ? 'contained' : 'text'}>{subcat}</Button>
            ))}
          </ButtonGroup>
        </Grid>
      }
      <Grid item xs={12}>
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
          <Button variant="contained" type="submit" fullWidth disabled={!amount || !category || !subcategory || !description}>Agregar Ingreso</Button>
        </form>
      </Grid>
    </Layout>
  );
};

export default NewIncome;
