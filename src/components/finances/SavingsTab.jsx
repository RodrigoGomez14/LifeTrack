import React, { useState } from 'react';
import {Grid,TextField,Paper,Card,CardHeader,IconButton, CardContent, Typography,Chip} from '@mui/material';
import { formatAmount } from '../../utils';
import ReactApexChart from 'react-apexcharts';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { database, auth } from '../../firebase'; // Importar el módulo de autenticación de Firebase

const SavingsTab = ({ data }) => {
  const [editPercentageActive,setEditPercentageActive] = useState(false)
  const [newPercentage,setNewPercentage] = useState(false)

  const seriesLineChart = [];
  const seriesColumnChart = [];
  const labelsChart = [];

  Object.keys(data.carMaintenanceHistory).forEach(key=>{
    seriesLineChart.push(data.carMaintenanceHistory[key].newTotal);
    seriesColumnChart.push(data.carMaintenanceHistory[key].amount)
    labelsChart.push(data.carMaintenanceHistory[key].date)
  })
  const optionsChart = {
    labels:labelsChart,
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
                options={optionsChart}
                series={[{name:'Acumulado',type:'line',data: seriesLineChart },{name:'Diario',type:'column',data: seriesColumnChart }]}
                type="line"
                height={300}
                width={1000}
            />
        </Grid>
    </Grid>
  );
};

export default SavingsTab;