import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button, ButtonGroup, TextField, Grid } from '@mui/material';
import { database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { useStore } from '../../store'; 
import { getDate } from '../../utils'

const NewExpense = () => {
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


    database.ref(`${auth.currentUser.uid}/expenses`).push({
      amount: parseFloat(amount),
      amountUSD: parseFloat(amount/dollarRate['venta']),
      category: category,
      subcategory: subcategory,
      date: getDate(),
      description: description,
      valorUSD: dollarRate['venta']
    }).then(() => {
      console.log('Expense sended')
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
    Servicios: ['Electricidad', 'Expensas','Impuestos', 'Internet','Celular'],
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
