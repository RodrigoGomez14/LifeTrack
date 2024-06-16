import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Input,
  InputLabel,
  FormControl,
  Grid,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { database, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { formatAmount } from "../../utils";
import { useStore } from "../../store";
import { getDate } from "../../utils";

const NewUberEntryPage = () => {
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [cash, setCash] = useState("");
  const [tips, setTips] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [travels, setTravels] = useState("");
  const [totalCash, setTotalCash] = useState(0);
  const [totalTips, setTotalTips] = useState(0);
  const [carMaintenanceAmount, setCarMaintenanceAmount] = useState("");

  // Form Management
  const handleCashInputChange = (e) => {
    setCash(e.target.value);
  };

  const handleTipsInputChange = (e) => {
    setTips(e.target.value);
  };

  const handleAddCash = () => {
    const cashValue = parseFloat(cash);
    if (!isNaN(cashValue)) {
      setTotalCash((prevTotalCash) => prevTotalCash + cashValue);
      setCash("");
    }
  };

  const handleAddTips = () => {
    const tipsValue = parseFloat(tips);
    if (!isNaN(tipsValue)) {
      setTotalTips((prevTotalTips) => prevTotalTips + tipsValue);
      setTips("");
    }
  };

  const handleFormSubmit = () => {
    if (!amount || !hours || !minutes) {
      alert("Por favor complete todos los campos");
      return;
    }

    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const amountValue = parseFloat(amount);
    const totalCashValue = parseFloat(totalCash);
    const totalTipsValue = parseFloat(totalTips);
    const amountUSDValue = amountValue / dollarRate["venta"];
    const totalCashUSDValue = totalCashValue / dollarRate["venta"];
    const totalTipsUSDValue = totalTipsValue / dollarRate["venta"];

    database.ref(`${auth.currentUser.uid}/uber/data`).push({
      date: getDate(),
      amount: amountValue,
      amountUSD: amountUSDValue,
      cash: totalCashValue,
      cashUSD: totalCashUSDValue,
      tips: totalTipsValue,
      tipsUSD: totalTipsUSDValue,
      duration: totalMinutes,
      travels: parseInt(travels),
      valorUSD: dollarRate["venta"],
    });

    // Actualiza la cantidad de viajes de los challenge
    const challengeRef = database.ref(`${auth.currentUser.uid}/uber/challenge`);
    challengeRef.transaction((data) => {
      if (data) {
        data.progress = (data.progress || 0) + parseInt(travels);
      }
      return data;
    });

    // Agregar el ingreso de efectivo a la base de datos para ingresos
    database.ref(`${auth.currentUser.uid}/incomes`).push({
      date: getDate(),
      amount: totalCashValue,
      amountUSD: totalCashUSDValue,
      category: "Uber",
      subCategory: "Efectivo Uber",
      description: "Efectivo Uber",
      valorUSD: dollarRate["venta"],
    });

    if (totalTipsValue > 0) {
      // Agregar el ingreso de propinas a la base de datos para ingresos
      database.ref(`${auth.currentUser.uid}/incomes`).push({
        date: getDate(),
        amountUSD: totalTipsUSDValue,
        amount: totalTipsValue,
        category: "Uber",
        subCategory: "Propinas Uber",
        description: "Propinas Uber",
        valorUSD: dollarRate["venta"],
      });
    }

    database
      .ref(`${auth.currentUser.uid}/uber/pending`)
      .set(userData.uber.pending + amountValue - totalCashValue);
    database
      .ref(`${auth.currentUser.uid}/savings/carMaintenancePending`)
      .set(
        userData.savings.carMaintenancePending + parseInt(carMaintenanceAmount)
      );

    // Agregar el ingreso de efectivo a la base de datos para ingresos
    database.ref(`${auth.currentUser.uid}/savings/carMaintenanceHistory`).push({
      date: getDate(),
      amount: parseInt(carMaintenanceAmount),
      amountUSD: parseFloat(carMaintenanceAmount) / dollarRate["venta"],
      newTotal:
        userData.savings.carMaintenance +
        parseInt(carMaintenanceAmount) +
        userData.savings.carMaintenancePending,
      newTotalUSD:
        userData.savings.carMaintenance / dollarRate["venta"] +
        parseFloat(carMaintenanceAmount) / dollarRate["venta"] +
        parseFloat(userData.savings.carMaintenancePending) /
          dollarRate["venta"],
    });

    // Actualizar el valor de ahorros en ARS y su historial
    database.ref(`${auth.currentUser.uid}/savings/amountARS`).set( userData.savings.amountARS + totalCashValue +  totalTipsValue );
    console.log(userData.savings.amountARS)
    console.log(totalCashValue)
    console.log(totalTipsValue)
    console.log(userData.savings.amountARS + totalCashValue + totalTipsValue )
    
    database.ref(`${auth.currentUser.uid}/savings/amountARSHistory`).push({
      date: getDate(),
      amount: totalCashValue+totalTipsValue,
      newTotal: (userData.savings.amountARS + totalCashValue + totalTipsValue),
    });

    setAmount("");
    setCash("");
    setTips("");
    setHours("");
    setMinutes("");

    navigate("/uber");
  };

  return (
    <Layout title="Finalizar Jornada Uber">
      <Grid container item xs={12} justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel htmlFor="efectivo">Efectivo</InputLabel>
            <Input
              id="efectivo"
              label="Efectivo"
              type="number"
              value={cash}
              onChange={handleCashInputChange}
              margin="normal"
              startAdornment={
                <InputAdornment position="start">
                  <IconButton onClick={handleAddCash}>
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" gutterBottom>
            Total en Efectivo: {formatAmount(totalCash)}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel htmlFor="propinas">Propinas</InputLabel>
            <Input
              id="propinas"
              label="Propinas"
              type="number"
              value={tips}
              onChange={handleTipsInputChange}
              margin="normal"
              startAdornment={
                <InputAdornment position="start">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleAddTips}
                  >
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" gutterBottom>
            Total de Propinas: {formatAmount(totalTips)}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Cantidad de Viajes"
            type="number"
            value={travels}
            onChange={(e) => setTravels(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Horas"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Minutos"
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid container item xs={12} justifyContent="center">
          <Alert severity="success" variant="filled">
            FONDO DE MANTENIMIENTO DEL AUTO :
            <TextField
              label="Mantenimiento"
              type="number"
              placeholder={amount * userData.savings.carMaintenancePercentage}
              value={carMaintenanceAmount}
              onChange={(e) => setCarMaintenanceAmount(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Alert>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            fullWidth
            disabled={!amount || !totalCash || !travels || !hours || !minutes}
            onClick={handleFormSubmit}
          >
            Finalizar Jornada
          </Button>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default NewUberEntryPage;
