import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Input,
  Select,
  MenuItem,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  ButtonGroup

} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../store";
import { formatAmount } from "../../utils";

const NewAditive = () => {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [dosisList, setDosisList] = useState([]);
  const [dosis, setDosis] = useState("");
  const [dosisMeasure, setDosisMeasure] = useState("");
  const [dosisName, setDosisName] = useState("");

  const handleNewAditive = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/aditives`
      )
      .push({
        type:type,
        name: name,
        brand: brand,
        dosis:dosisList
      });

    setName("");
    setType("");
    setBrand("");
    setDosisList([]);

    navigate(`/Aditivos`);
  };

  const handleAddDosis = () => {
    let auxDosis = dosisList
    auxDosis.push({quantity:dosis,measure:dosisMeasure,name:dosisName})
    setDosisList(auxDosis)
    setDosis("")
    setDosisMeasure("")
    setDosisName("")
  };
  return (
    <Layout title="Nuevo Aditivo">
      <Grid item xs={12}>
        <ButtonGroup fullWidth>
          <Button onClick={() => setType('Fertilizante')} variant={type === 'Fertilizante' ? 'contained' : 'text'}>Fertilizante</Button>
          <Button onClick={() => setType('Insecticida')} variant={type === 'Insecticida' ? 'contained' : 'text'}>Insecticida</Button>
        </ButtonGroup>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <TextField
          label="Nombre"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Marca"
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth>
          <InputLabel htmlFor="Etapa">Etapa</InputLabel>
          <Input
            id='Etapa'
            label="Etapa"
            type="text"
            value={dosisName}
            onChange={(e) => setDosisName(e.target.value)}
            margin="normal"
          />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel htmlFor="Dosis">Dosis</InputLabel>
          <Input
            id='Dosis'
            label="Dosis"
            type="number"
            value={dosis}
            onChange={(e) => setDosis(e.target.value)}
            margin="normal"
            startAdornment={
              <InputAdornment position="start">
                <IconButton
                  onClick={handleAddDosis}
                >
                  <AddIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <Select
          value={dosisMeasure}
          label="Medida"
          onChange={(e) => setDosisMeasure(e.target.value)}
        >
          <MenuItem value='Ml/L'>Ml/L</MenuItem>
          <MenuItem value='Grs/L'>Grs/L</MenuItem>
          <MenuItem value='Cm3/L'>Cm3/L</MenuItem>
        </Select>
        <Button
          variant="contained"
          onClick={handleNewAditive}
          disabled={!name || !brand }
        >
          AGREGAR
        </Button>
      </Grid>
    </Layout>
  );
};

export default NewAditive;
