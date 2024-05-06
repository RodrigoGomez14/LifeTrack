import React, {useEffect,useState} from 'react';
import {Grid,Typography,Card,CardHeader,IconButton,Paper} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { formatAmount} from '../../utils';
import { useStore } from '../../store'; // Importar el store de Zustand
import { database, auth } from '../../firebase'; // Importar el módulo de autenticación de Firebase

const CardPendingUber = ({setShowDialog}) => {
    const {userData, dollarRate} = useStore(); // Obtener estados del store
    const [resetDisabled, setResetDisabled] = useState(true);

    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 para domingo, 1 para lunes, ..., 6 para sábado
    
    const resetPending = () => {
        const pending = parseFloat(userData.uber.pending);
    
        // Verificar si hoy es lunes (dayOfWeek === 1)
        if (dayOfWeek === 1 && pending > 0) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;
          const day = currentDate.getDate();
          
          database.ref(`${auth.currentUser.uid}/incomes`).push({
            date: `${day}/${month}/${year}`,
            amount: pending,
            amountUSD: parseFloat(pending/dollarRate['venta']),
            category: 'Uber',
            subCategory: 'Semanal Uber',
            description: 'Semanal Uber',
            valorUSD:dollarRate['venta']
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
        // Si el día actual es lunes (1), entonces deshabilita el reset
        setResetDisabled(dayOfWeek !== 1);
      }, []); 
    return(
      <Grid item>
        <Paper elevation={6}>
            <Card>
                <CardHeader
                action={
                  <IconButton 
                      aria-label="settings"
                      disabled={resetDisabled}
                      onClick={resetPending} 
                  >
                      <RestoreIcon />
                  </IconButton>
                }
                style={{backgroundColor:userData.uber.pending > 0 ? 'green' : 'red'}}
                title={
                  <>
                    <Typography variant="caption">
                      Pago Semanal
                    </Typography>
                    <Typography variant="h4">
                    {formatAmount(userData.uber.pending)}
                    </Typography>
                    <Typography variant="body2">
                      USD {formatAmount(userData.uber.pending / dollarRate['venta'])}
                    </Typography>
                  </>
                }
                />
            </Card>
        </Paper>
      </Grid>
    )
}
export default CardPendingUber;
