// NewUberEntryPage.js
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button, TextField, Typography } from '@mui/material';
import { database } from '../firebase';
import { useAuth } from '../hooks/useAuth'; // Importa el hook useAuth para obtener el UID del usuario

const NewUberEntryPage = () => {
  const auth = useAuth(); // Obtiene el contexto de autenticación

  const [amount, setAmount] = useState('');
  const [cash, setCash] = useState('');
  const [time, setTime] = useState('');

  const handleFormSubmit = () => {
    // Verificar que los campos no estén vacíos
    if (!amount || !cash || !time) {
      alert('Por favor complete todos los campos');
      return;
    }

    // Obtener la fecha actual
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Asegura que el mes tenga dos dígitos

    // Verificar que el usuario esté autenticado y obtener su UID
    const uid = auth.user ? auth.user.uid : null;

    if (!uid) {
      alert('No se pudo obtener el UID del usuario');
      return;
    }

    // Guardar la entrada en la base de datos
    console.log(uid)
    console.log(year)
    console.log(month)
    database.ref(`${uid}/uber/${year}/${month}`).push({
        amount: parseFloat(amount),
        cash: parseFloat(cash),
        duration: parseInt(time),
        date: new Date()
    });

    // Limpiar los campos después de enviar el formulario
    setAmount('');
    setCash('');
    setTime('');
    alert('Entrada agregada correctamente');
  };

  return (
    <Layout title="Nueva Entrada de Uber">
      <div>
        <Typography variant="h4" gutterBottom>
          Nueva Entrada de Uber
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
            label="Efectivo"
            type="number"
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Tiempo (minutos)"
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button variant="contained" type="submit">Agregar Entrada</Button>
        </form>
      </div>
    </Layout>
  );
};

export default NewUberEntryPage;
