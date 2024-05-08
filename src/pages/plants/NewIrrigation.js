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

const NewIrrigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [measure, setMeasure] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleNewIrrigation = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/irrigations`
      )
      .push({
        date: getDate(),
        quantity: quantity,
        measure: measure,
        fertilizantes: false,
      });

    setMeasure("");
    setQuantity("");

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  return (
    <Layout title="Nuevo Riego">
      <Grid container item xs={12} justifyContent="center">
        <TextField
          label="Cantidad"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <Select
          value={measure}
          label="Medida"
          onChange={(e) => setMeasure(e.target.value)}
        >
          <MenuItem value='ML'>ML</MenuItem>
          <MenuItem value='L'>L</MenuItem>
          <MenuItem value='CM3'>CM3</MenuItem>
        </Select>
        <Button
          variant="contained"
          onClick={handleNewIrrigation}
          disabled={!measure || !quantity}
        >
          AGREGAR
        </Button>
      </Grid>
    </Layout>
  );
};

export default NewIrrigation;
