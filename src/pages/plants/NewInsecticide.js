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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useStore } from "../../store";

const NewInsecticide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appMethod, setAppMethod] = useState("");
  const [product, setProduct] = useState("");

  const handleNewInsecticide = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/insecticides`
      )
      .push({
        date: getDate(),
        product: product,
        appMethod: appMethod,
        fertilizantes: false,
      });

    setAppMethod("");
    setProduct("");

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  return (
    <Layout title="Nuevo Insecticida">
      <Grid container item xs={12} justifyContent="center">
        <TextField
          label="Producto"
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <Select
          value={appMethod}
          label="Metodo de Aplicacion"
          onChange={(e) => setAppMethod(e.target.value)}
        >
          <MenuItem value='Foliar'>Foliar</MenuItem>
          <MenuItem value='Raices'>Raices</MenuItem>
        </Select>
        <Button
          variant="contained"
          onClick={handleNewInsecticide}
          disabled={!appMethod || !product}
        >
          AGREGAR
        </Button>
      </Grid>
    </Layout>
  );
};

export default NewInsecticide;
