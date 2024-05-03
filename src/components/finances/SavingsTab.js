import React, { useState } from 'react';
import {Accordion,AccordionSummary,AccordionDetails,Grid,TextField,Tabs,Tab,Card,CardHeader,IconButton, CardContent} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { formatAmount, getMonthName, sumTransactionsByCategory,getCategoryIcon } from '../../utils';
import TransactionsTabsList from './TransactionsTabsList';
import ReactApexChart from 'react-apexcharts';
import { useStore } from '../../store'; 
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { database, auth } from '../../firebase'; // Importar el módulo de autenticación de Firebase

const SavingsTab = ({ data }) => {
  const currentDate = new Date();
  const {userData,dollarRate} = useStore();
  const [editPercentageActive,setEditPercentageActive] = useState(false)
  const [newPercentage,setNewPercentage] = useState(false)

  const seriesPieChart = [];

  Object.keys(data.carMaintenanceHistory).map(key=>{
    seriesPieChart.push({
        x: data.carMaintenanceHistory[key].date,
        y: data.carMaintenanceHistory[key].newTotal
    });
  })
  const optionsPieChart = {
    tooltip:{
        y:{
            formatter: val=> formatAmount(val)
        }
    },
    stroke:{
        curve: 'smooth',
      },
  };

  const editPercentage = () =>{
    database.ref(`${auth.currentUser.uid}/savings/carMaintenancePercentage`).set(parseFloat(newPercentage/100));
  }

  const handleSetEditPercentageActive = () => {
    setEditPercentageActive(!editPercentageActive);
  };
  return (
    <Grid container item xs={12} justifyContent='center' spacing={3}>
        <Grid item>
            <Card>
                <CardHeader
                    title={formatAmount(data.amountUSD)}
                    subheader='Ahorros en USD'
                />
            </Card>
        </Grid>
        <Grid item>
            <Card>
                <CardHeader
                    title={formatAmount(data.carMaintenance)}
                    subheader='Fondo Mantenimiento Auto'
                />
            </Card>
        </Grid>
        <Grid item>
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
        </Grid>
        <Grid container item xs={12} justifyContent='center'>
            <ReactApexChart
                options={optionsPieChart}
                series={[{ name: 'Mantenimiento del Auto', data: seriesPieChart }]}
                type="line"
                width={500}
            />
        </Grid>
    </Grid>
  );
};

export default SavingsTab;