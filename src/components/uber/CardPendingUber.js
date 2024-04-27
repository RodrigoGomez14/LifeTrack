import React, {useEffect,useState} from 'react';
import {Grid,Typography,Card,CardHeader,IconButton,LinearProgress,Button,Alert} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import { formatAmount} from '../../utils';
import { useStore } from '../../store'; // Importar el store de Zustand
import { database, auth } from '../../firebase'; // Importar el módulo de autenticación de Firebase

const CardPendingUber = ({setShowDialog}) => {
    const {userData, dollarRate} = useStore(); // Obtener estados del store
    const [resetDisabled, setResetDisabled] = useState(true);
    const resetPending = () => {
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 para domingo, 1 para lunes, ..., 6 para sábado
        const pending = parseFloat(userData.uber.pending);
    
        // Verificar si hoy es lunes (dayOfWeek === 1)
        if (dayOfWeek === 4 && pending > 0) {
          const year = currentDate.getFullYear().toString();
          const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
          const day = currentDate.getDate().toString().padStart(2, '0');
          
          database.ref(`${auth.currentUser.uid}/incomes/${year}/data/${month}/data`).push({
            date: `${day}/${month}/${year}`,
            amount: pending,
            amountUSD: parseFloat(pending/dollarRate['venta']),
            category: 'Uber',
            subCategory: 'Semanal Uber',
            description: 'Semanal Uber',
            valorUSD:dollarRate['venta']
          });
    
          // Actualizar totales mensuales y anuales en la base de datos para ingresos
          const yearlyRef = database.ref(`${auth.currentUser.uid}/incomes/${year}`);
          yearlyRef.transaction((data) => {
            if (data) {
              data.total = (data.total || 0) + parseFloat(pending);
              data.totalUSD = (data.totalUSD || 0) + parseFloat(pending/dollarRate['venta']);
            }
            return data;
          });
    
          const monthlyRef = database.ref(`${auth.currentUser.uid}/incomes/${year}/data/${month}`);
          monthlyRef.transaction((data) => {
            if (data) {
              data.total = (data.total || 0) + parseFloat(pending);
              data.totalUSD = (data.totalUSD || 0) + parseFloat(pending/dollarRate['venta']);
            }
            return data;
          });
          database.ref(`${auth.currentUser.uid}/uber/pending`).set(0);
          database.ref(`${auth.currentUser.uid}/savings/carMaintenance`).set(userData.savings.carMaintenance + parseFloat(pending*userData.savings.carMaintenancePercentage));
    
          // Agregar el ingreso de efectivo a la base de datos para ingresos
          database.ref(`${auth.currentUser.uid}/savings/carMaintenanceHistory`).push({
            date: `${day}/${month}/${year}`,
            amount: parseFloat(pending*userData.savings.carMaintenancePercentage),
            amountUSD: parseFloat(pending*userData.savings.carMaintenancePercentage)/dollarRate['venta'],
            newTotal: userData.savings.carMaintenance+parseFloat(pending*userData.savings.carMaintenancePercentage),
            newTotalUSD: (userData.savings.carMaintenance/dollarRate['venta'])+(parseFloat(pending*userData.savings.carMaintenancePercentage)/dollarRate['venta'])
          });
    
          setShowDialog(true)
          setTimeout(() => {
            setShowDialog(false)
          }, 1000);
        }
      };

    useEffect(() => {
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay(); // 0 (Domingo) - 6 (Sábado)
    
        // Si el día actual es lunes (1), entonces deshabilita el reset
        setResetDisabled(dayOfWeek !== 4);
      }, []); 
    return(
        <Grid container item xs={12}justifyContent='center'>
            <Grid item>
                <Card>
                    <CardHeader
                    action={
                        <>
                        <IconButton 
                            aria-label="settings"
                            disabled={resetDisabled}
                            onClick={resetPending} 
                        >
                            <RestoreIcon />
                        </IconButton>
                        <Link to="/NewUberEntry">
                            <IconButton aria-label="settings">
                            <AddIcon />
                            </IconButton>
                        </Link>
                        </>
                    }
                    style={{backgroundColor:userData.uber.pending > 0 ? 'green' : 'red'}}
                    title={`${formatAmount(userData.uber.pending)} - USD ${formatAmount(userData.uber.pending / dollarRate['venta'])}`}
                    subheader={<>
                    <Typography variant="body1">
                        Pendiente de Pago
                    </Typography>
                    <Alert variant='filled' severity='info'>
                        Mantenimiento del Auto: {formatAmount(parseFloat(userData.uber.pending*userData.savings.carMaintenancePercentage))}
                    </Alert>
                    </>}
                    />
                </Card>
            </Grid>
        </Grid>
    )
}
export default CardPendingUber;
