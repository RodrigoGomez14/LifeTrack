import React, { useState } from 'react';
import {Grid,TextField,Paper,Card,CardHeader,IconButton, CardContent, Typography,Chip} from '@mui/material';
import { formatAmount } from '../../utils';
import ReactApexChart from 'react-apexcharts';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { database, auth } from '../../firebase'; // Importar el módulo de autenticación de Firebase
import { useStore } from '../../store'; // Importar el store de Zustand
import { getDate } from "../../utils";

const SavingsTab = ({ data }) => {
    const {userData} = useStore(); // Obtener estados del store
    const [editPercentageActive,setEditPercentageActive] = useState(false)
  const [newPercentage,setNewPercentage] = useState(false)

  const seriesCarLineChart = [];
  const seriesCarColumnChart = [];
  const labelsCarChart = [];

  const seriesUSDLineChart = [];
  const seriesUSDColumnChart = [];
  const labelsUSDChart = [];
  
  const seriesARSLineChart = [];
  const seriesARSColumnChart = [];
  const labelsARSChart = [];

  Object.keys(data.carMaintenanceHistory).forEach(key=>{
    seriesCarLineChart.push(data.carMaintenanceHistory[key].newTotal);
    seriesCarColumnChart.push(data.carMaintenanceHistory[key].amount)
    labelsCarChart.push(data.carMaintenanceHistory[key].date)
  })
  Object.keys(data.amountUSDHistory).forEach(key=>{
    seriesUSDLineChart.push(data.amountUSDHistory[key].newTotal);
    seriesUSDColumnChart.push(data.amountUSDHistory[key].amountUSD)
    labelsUSDChart.push(data.amountUSDHistory[key].date)
  })
  data.amountARSHistory &&
  (Object.keys(data.amountARSHistory).forEach(key=>{
    seriesARSLineChart.push(data.amountARSHistory[key].newTotal);
    seriesARSColumnChart.push(data.amountARSHistory[key].amount)
    labelsARSChart.push(data.amountARSHistory[key].date)
  }))

  const optionsCarChart = {
    labels:labelsCarChart,
    tooltip:{
        y:{
            formatter: val=> formatAmount(val)
        }
    },
    markers:{
        size:3
    },
    stroke:{
        curve: 'smooth',
      },
  };
  const optionsUSDChart = {
    labels:labelsUSDChart,
    tooltip:{
        y:{
            formatter: val=> formatAmount(val)
        }
    },
    markers:{
        size:3
    },
    stroke:{
        curve: 'smooth',
      },
  };
  const optionsARSChart = {
    labels:labelsARSChart,
    tooltip:{
        y:{
            formatter: val=> formatAmount(val)
        }
    },
    markers:{
        size:3
    },
    stroke:{
        curve: 'smooth',
      },
  };

  const editPercentage = () =>{
    database.ref(`${auth.currentUser.uid}/savings/carMaintenancePercentage`).set(parseFloat(newPercentage/100));
  }
  const addPendingToTotal = () =>{
    const totalRef = database.ref(`${auth.currentUser.uid}/savings`);
    totalRef.transaction((data) => {
      if (data) {
        data.carMaintenance = (data.carMaintenance || 0) + parseInt(data.carMaintenancePending);
      }
      return data;
    });

    database.ref(`${auth.currentUser.uid}/savings/carMaintenancePending`).set(0);

    // Actualizar el valor de ahorros en ARS y su historial
    database.ref(`${auth.currentUser.uid}/savings/amountARS`).set( userData.savings.amountARS - userData.savings.carMaintenancePending);
    database.ref(`${auth.currentUser.uid}/savings/amountARSHistory`).push({
      date: getDate(),
      amount: -userData.savings.carMaintenancePending,
      newTotal: (userData.savings.amountARS - userData.savings.carMaintenancePending),
    });
  }

  const handleSetEditPercentageActive = () => {
    setEditPercentageActive(!editPercentageActive);
  }; 
  return (
    <Grid container item xs={12} justifyContent='center' spacing={3}>
        <Grid item>
            <Paper elevation={6}>
                <Card>
                    <CardHeader
                        title={formatAmount(data.amountARS)}
                        subheader='Ahorros en ARS'
                    />
                </Card>
            </Paper>
        </Grid>
        <Grid item>
            <Paper elevation={6}>
                <Card>
                    <CardHeader
                        title={formatAmount(data.amountUSD)}
                        subheader='Ahorros en USD'
                    />
                </Card>
            </Paper>
        </Grid>
        <Grid item>
            <Paper elevation={6}>
                <Card>
                    <CardHeader
                        title={<Typography variant='h5'>{formatAmount(data.carMaintenance)}{data.carMaintenancePending?<><br/><Chip color='success' label={`+${formatAmount(data.carMaintenancePending)}`}></Chip></>:null}</Typography>}
                        subheader='Fondo Mantenimiento Auto'
                        action={
                            data.carMaintenancePending?
                                <IconButton 
                                    aria-label="settings"
                                    onClick={addPendingToTotal} 
                                    >
                                    <CheckIcon />
                                </IconButton>
                                :
                                null
                        }
                    />
                </Card>
            </Paper>
        </Grid>
        <Grid item>
            <Paper elevation={6}>
                <Card>
                    <CardHeader
                        title={`%${data.carMaintenancePercentage*100}`}
                        subheader='Fondo Mantenimiento'
                        action={
                            editPercentageActive?
                                <IconButton 
                                    aria-label="settings"
                                    onClick={editPercentage} 
                                    >
                                    <CheckIcon />
                                </IconButton>
                                :
                                <IconButton 
                                    aria-label="settings"
                                    onClick={()=>{handleSetEditPercentageActive()}} 
                                >
                                    <EditIcon />
                                </IconButton>
                        }
                    />
                    {editPercentageActive &&
                        <CardContent>
                            <TextField
                                label="% Nuevo"
                                type="number"
                                value={newPercentage}
                                onChange={(e) => setNewPercentage(e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                            />
                        </CardContent>
                    }
                </Card>
            </Paper>
        </Grid>
        <Grid container item xs={12} justifyContent='center'>
            <ReactApexChart
                options={optionsCarChart}
                series={[{name:'Acumulado',type:'line',data: seriesCarLineChart },{name:'Diario',type:'column',data: seriesCarColumnChart }]}
                type="line"
                height={300}
                width={1000}
            />
        </Grid>
        <Grid container item xs={12} justifyContent='center'>
            <ReactApexChart
                options={optionsUSDChart}
                series={[{name:'Acumulado',type:'line',data: seriesUSDLineChart },{name:'Diario',type:'column',data: seriesUSDColumnChart }]}
                type="line"
                height={300}
                width={1000}
            />
        </Grid>
        <Grid container item xs={12} justifyContent='center'>
            <ReactApexChart
                options={optionsARSChart}
                series={[{name:'Acumulado',type:'line',data: seriesARSLineChart },{name:'Diario',type:'column',data: seriesARSColumnChart }]}
                type="line"
                height={300}
                width={1000}
            />
        </Grid>
    </Grid>
  );
};

export default SavingsTab;