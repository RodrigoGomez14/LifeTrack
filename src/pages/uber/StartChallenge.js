import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Button, ButtonGroup, TextField, Grid } from '@mui/material';
import { auth, database } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const StartChallenge = () => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [goal, setGoal] = useState('');

  const handleFormSubmit = () => {
    if (!amount || !goal) {
      alert('Por favor complete todos los campos');
      return; 
    }

    database.ref(`${auth.currentUser.uid}/uber/challenge`).set({
      amount:amount,
      goal:goal,
      progress:0
    }).then(() => {
    });

    setAmount('');
    setGoal('');

    navigate('/uber');
  };

  // Define los goals
  const goals = [10,20,30,40,50,60,70]


  return (
    <Layout title="Empezar Challenge">
      <Grid item xs={12}>
        <ButtonGroup fullWidth>
          {goals.map((gl, index) => (
            <Button key={index} onClick={() => setGoal(gl)} variant={goal === gl ? 'contained' : 'text'}>{gl}</Button>
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
          <Button variant="contained" type="submit" disabled={!amount || !goal }>Iniciar Challenge</Button>
        </form>
      </Grid>
    </Layout>
  );
};

export default StartChallenge;
