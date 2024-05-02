import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Grid, Typography, Card, CardHeader, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { formatAmount, getPreviousMonday, getMonthName } from '../../utils';
import ReactApexChart from 'react-apexcharts';
import AddIcon from '@mui/icons-material/Add';

const Home = () => {
  return (
    <Layout title="Inicio">
      
    </Layout>
  );
};

export default Home;
