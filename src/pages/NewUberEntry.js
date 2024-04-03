import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Button, TextField, Typography } from '@mui/material';
import { database } from '../firebase';
import { useNavigate } from 'react-router-dom'; // Importa el hook useNavigate

const NewUberEntryPage = ({ uid ,pending}) => {
  const navigate = useNavigate(); // Obtiene la función de navegación

  const [amount, setAmount] = useState('');
  const [cash, setCash] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [totalCash, setTotalCash] = useState(0); // Estado para almacenar el total en efectivo

  const handleCashInputChange = (e) => {
    setCash(e.target.value);
  };

  const handleAddCash = () => {
    const cashValue = parseFloat(cash);
    if (!isNaN(cashValue)) {
      setTotalCash(prevTotalCash => prevTotalCash + cashValue);
      setCash('');
    }
  };

  const handleFormSubmit = () => {
    // Verificar que los campos no estén vacíos
    if (!amount || !hours || !minutes) {
      alert('Por favor complete todos los campos');
      return;
    }

    // Convertir horas y minutos a minutos
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

    // Obtener la fecha actual
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0')

    // Guardar la entrada en la base de datos
    database.ref(`${uid}/uber/data/${year}/${month}`).push({
      date: `${day}/${month}/${year}`,
      amount: parseFloat(amount),
      cash: parseFloat(totalCash),
      duration: totalMinutes,
    });

    database.ref(`${uid}/uber/pending`).set(pending+(parseFloat(amount)-parseFloat(totalCash)));
    database.ref(`${uid}/incomes/${year}/${month}`).push({
      date: `${day}/${month}/${year}`,
      amount: parseFloat(totalCash),
      category:'Uber',
      subCategory:'Efectivo Uber',
      description:'Efectivo Uber'
    });




    // Limpiar los campos después de enviar el formulario
    setAmount('');
    setCash('');
    setHours('');
    setMinutes('');

    // Redirigir al usuario a la ruta raíz "/uber"
    navigate('/uber');
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
            onChange={handleCashInputChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleAddCash}>Agregar a Total Efectivo</Button>
          <Typography variant="body1" gutterBottom>
            Total en Efectivo: {totalCash}
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
          <Button variant="contained" type="submit">Agregar Entrada</Button>
        </form>
      </div>
    </Layout>
  );
};

export default NewUberEntryPage;
