import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button, TextField, MenuItem, Input, Select, FormControlLabel, Grid } from '@mui/material';
import { database,auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const NewPlant = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [etapa, setEtapa] = useState('Germinacion');
  const [inicioGerminacion, setInicioGerminacion] = useState('');
  const [inicioVegetativo, setInicioVegetativo] = useState('');
  const [inicioFloracion, setInicioFloracion] = useState('');


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
          <Select
            value={etapa}
            label="Etapa"
            onChange={(e) => setEtapa(e.target.value)}
          >
            <MenuItem value='Germinacion'>Germinacion</MenuItem>
            <MenuItem value='Vegetativo'>Vegetativo</MenuItem>
            <MenuItem value='Floracion'>Floracion</MenuItem>
          </Select>
          <FormControlLabel
              label='Inicio de Germinacion'
              labelPlacement='top'
              control={
                  <Input type='date' value={inicioGerminacion} disabled={!etapa} onChange={e=>{setInicioGerminacion(e.target.value)}}/>
              }
          />
          <FormControlLabel
              label='Inicio de Vegetativo'
              labelPlacement='top'
              control={
                  <Input type='date' disabled={ etapa === 'Germinacion'} value={inicioVegetativo}onChange={e=>{setInicioVegetativo(e.target.value)}}/>
              }
          />
          <FormControlLabel
              label='Inicio de Floracion'
              labelPlacement='top'
              control={
                  <Input type='date' disabled={etapa !== 'Floracion'} value={inicioFloracion}onChange={e=>{setInicioFloracion(e.target.value)}}/>
              }
          />
          <Button variant="contained" onClick={handleFormSubmit} disabled={!name || !quantity}>AGREGAR</Button>
      </Grid>
    </Layout>
  );
};

export default NewPlant;
