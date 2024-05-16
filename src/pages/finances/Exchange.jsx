import { useState } from "react";
import Layout from '../../components/layout/Layout';
import { ButtonGroup, Grid, Button,TextField, Typography} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { database,auth } from '../../firebase';
import { useStore } from '../../store'; 
import { getDate,formatAmount } from '../../utils'

const Exchange = () => {
  const {userData,dollarRate} = useStore();

  const [exRate, setExRate] = useState("");
  const [amountUSD, setAmountUSD] = useState("");
  const [amountARS, setAmountARS] = useState("");
  const [operationType, setOperationType] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (operationType === "Compra") {
      database.ref(`${auth.currentUser.uid}/expenses`).push({
          operationType: operationType,
          amount: parseFloat(amountARS),
          amountUSD: parseFloat(amountARS/exRate),
          category: 'Exchange',
          date: getDate(),
          valorUSD: exRate
        })
    } 
    else {
      database.ref(`${auth.currentUser.uid}/incomes`).push({
          operationType: operationType,
          amount: parseFloat(amountARS),
          amountUSD: parseFloat(amountARS/exRate),
          category: 'Exchange',
          date: getDate(),
          valorUSD: exRate
        })
    }


    // Actualizar el valor de ahorros en USD
    if (operationType === "Compra") {
      // Aumentar el valor de ahorros en USD
      database.ref(`${auth.currentUser.uid}/savings/amountUSD`).set( userData.savings.amountUSD + parseFloat(amountARS/exRate));
    } else {
      database.ref(`${auth.currentUser.uid}/savings/amountUSD`).set( userData.savings.amountUSD - parseFloat(amountARS/exRate));
    }

    // Agregar el ingreso de efectivo a la base de datos para ingresos
    database.ref(`${auth.currentUser.uid}/savings/amountUSDHistory`).push({
      date: getDate(),
      operationType:operationType,
      amount: amountARS,
      amountUSD: parseFloat(amountARS/exRate),
      newTotal: operationType==='Compra'?(userData.savings.amountUSD + parseFloat(amountARS/exRate)):(userData.savings.amountUSD - parseFloat(amountARS/exRate)),
    });

    navigate("/finanzas");
  };
  
  const handleChangeOperationType = (type) => {
    setOperationType(type);
    setAmountUSD("");
    setAmountARS("");
    setExRate("");
  };
  const handleChangeAmount = (e) => {
    setAmountUSD(e.target.value)
    setAmountARS(e.target.value*exRate)
  }

  return (
    <Layout title='Exchange'>
        <Grid item xs={12}>
            <ButtonGroup fullWidth>
                <Button onClick={() => handleChangeOperationType('Compra')} variant={operationType === 'Compra' ? 'contained' : 'text'}>Compra</Button>
                <Button onClick={() => handleChangeOperationType('Venta')} variant={operationType === 'Venta' ? 'contained' : 'text'}>Venta</Button>
            </ButtonGroup>
        </Grid>
        <Grid item xs={12}>
            <form onSubmit={handleSubmit}>
            <TextField
                label="Tasa de conversion"
                type="number"
                disabled={!operationType}
                placeholder={formatAmount(dollarRate['venta'])}
                value={exRate}
                onChange={(e) => setExRate(e.target.value)}
                required
                fullWidth
                margin="normal"
                />
            {operationType &&
              <Typography variant='h6'>{operationType === 'Compra' ? 'Recibí' : 'Entregue'}</Typography>
            }
            <TextField
                label="Monto USD"
                type="number"
                disabled={!exRate && !amountUSD}
                value={amountUSD}
                onChange={handleChangeAmount}
                required
                fullWidth
                margin="normal"
            />
            {operationType &&
              <Typography variant='h6'>{operationType === 'Compra' ? 'Entregue' : 'Recibí' } {formatAmount(amountARS)}</Typography>
            }
            <Button variant="contained" type="submit" fullWidth disabled={!amountUSD && !exRate}>COMPLETAR CAMBIO</Button>
            </form>
        </Grid>
    </Layout>
  );
};
export default Exchange;
