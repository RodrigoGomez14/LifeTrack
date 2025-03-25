import React from 'react';
import Layout from '../../components/layout/Layout';
import HabitForm from '../../components/habits/HabitForm';
import { Box } from '@mui/material';

const NewHabit = () => {
  return (
    <Layout title="Crear Nuevo Hábito">
      <Box py={2}>
        <HabitForm />
      </Box>
    </Layout>
  );
};

export default NewHabit; 