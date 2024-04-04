import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button, TextField, Typography,ButtonGroup,Grid} from '@mui/material';
import { database } from '../firebase';
import { useNavigate } from 'react-router-dom'; // Importa el hook useNavigate

const NewIncome = ({ uid }) => {
  const navigate = useNavigate(); // Obtiene la función de navegación

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');

  const handleFormSubmit = () => {
    // Verificar que los campos no estén vacíos
    if (!amount || !category || !subcategory || !description) {
      alert('Por favor complete todos los campos');
      return;
    }

    // Obtener la fecha actual
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    // Guardar el ingreso en la base de datos
    database.ref(`${uid}/incomes/${year}/${month}`).push({
      amount: parseFloat(amount),
      category: category,
      subcategory: subcategory,
      date: `${day}/${month}/${year}`,
      description: description,
    });

    // Limpiar los campos después de enviar el formulario
    setAmount('');
    setCategory('');
    setSubcategory('');
    setDescription('');

    // Redirigir al usuario a la página de finanzas
    navigate('/finanzas');
  };

  return (
    <Layout title="Nuevo Ingreso">
      <Grid container justifyContent='center'>
        <Grid item xs={12}>
          <ButtonGroup fullWidth>
            <Button onClick={() => setCategory('Sueldo')} variant={category === 'Sueldo' ? 'contained' : 'text'}>Sueldo</Button>
            <Button onClick={() => setCategory('Uber')} variant={category === 'Uber' ? 'contained' : 'text'}>Uber</Button>
            <Button onClick={() => setCategory('Freelance')} variant={category === 'Freelance' ? 'contained' : 'text'}>Freelance</Button>
            <Button onClick={() => setCategory('Camila')} variant={category === 'Camila' ? 'contained' : 'text'}>Camila</Button>
            <Button onClick={() => setCategory('Extras')} variant={category === 'Extra' ? 'contained' : 'text'}>Extra</Button>
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
            <Button variant="contained" type="submit" disabled={!amount || !category || !subcategory || !description?true:false}>Agregar Ingreso</Button>          </form>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default NewIncome;
