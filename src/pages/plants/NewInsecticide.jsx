import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Box
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";

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
      });

    setAppMethod("");
    setProduct("");

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  return (
    <Layout title="Nuevo Insecticida">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Producto"
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Método de Aplicación</InputLabel>
              <Select
                value={appMethod}
                label="Método de Aplicación"
                onChange={(e) => setAppMethod(e.target.value)}
              >
                <MenuItem value='Foliar'>Foliar</MenuItem>
                <MenuItem value='Raices'>Raíces</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleNewInsecticide}
              disabled={!appMethod || !product}
              fullWidth
            >
              AGREGAR
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default NewInsecticide;
