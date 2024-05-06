import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button, TextField, Typography, InputAdornment, IconButton, Input, InputLabel, FormControl, Grid,Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { database,auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../../utils';
import { useStore } from '../../store'; 

const NewPlant = () => {
  const {userData,dollarRate} = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');


  const handleFormSubmit = () => {
    if (!name || !quantity) {
      alert('Por favor complete todos los campos');
      return;
    }

    database.ref(`${auth.currentUser.uid}/plants/active`).push({
      name:name,
      quantity:parseInt(quantity)
    });

    setName('');
    setQuantity('');

    navigate('/Plantas');
  };

  return (
    <Layout title="Nueva Planta">
      <Grid container item xs={12} justifyContent='center'>
          <TextField
            label="Nombre"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleFormSubmit} disabled={!name || !quantity}>AGREGAR</Button>
      </Grid>
    </Layout>
  );
};

export default NewPlant;
