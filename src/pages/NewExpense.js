import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button, TextField, Typography } from '@mui/material';
import { database } from '../firebase';
import { useNavigate } from 'react-router-dom'; // Importa el hook useNavigate

const NewExpense = ({ uid, pending }) => {
  const navigate = useNavigate(); // Obtiene la función de navegación

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const handleFormSubmit = () => {
    // Verificar que los campos no estén vacíos
    if (!amount || !category || !subcategory || !date || !description) {
      alert('Por favor complete todos los campos');
      return;
    }

    // Obtener la fecha actual
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    // Guardar el gasto en la base de datos
    database.ref(`${uid}/expenses/${year}/${month}`).push({
      amount: parseFloat(amount),
      category: category,
      subcategory: subcategory,
      date: `${day}/${month}/${year}`,
      description: description,
    });

    // Actualizar el valor de pending
    database.ref(`${uid}/pending`).set(pending - parseFloat(amount));

    // Limpiar los campos después de enviar el formulario
    setAmount('');
    setCategory('');
    setSubcategory('');
    setDate('');
    setDescription('');

    // Redirigir al usuario a la página de finanzas
    navigate('/finanzas');
  };

  return (
    <Layout title="Nuevo Gasto">
      <div>
        <Typography variant="h4" gutterBottom>
          Nuevo Gasto
        </Typography>
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
            label="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Subcategoría"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
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
          <Button variant="contained" type="submit">Agregar Gasto</Button>
        </form>
      </div>
    </Layout>
  );
};

export default NewExpense;
