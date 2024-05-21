import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useStore } from "../../store";

const NewTransplant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {userData} = useStore()
  const [newVol, setNewVol] = useState("");

  const handleNewTransplant = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/transplants`
      )
      .push({
        date: getDate(),
        previousPot: userData.plants.active[checkSearch(location.search)].potVolume,
        newPot: parseInt(newVol),
      });
    
    
    database.ref(`${auth.currentUser.uid}/plants/active/${checkSearch(location.search)}`).transaction((data) => {
      if (data) {
        data.potVolume = parseInt(newVol);
      }
      return data;
    });

    setNewVol("");

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  return (
    <Layout title="Nuevo Riego">
      <Grid container item>
        <TextField
          label="Volumen de la nueva Maceta"
          type="number"
          value={newVol}
          onChange={(e) => setNewVol(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
      </Grid>
      <Grid container item>
        <Button
          variant="contained"
          onClick={handleNewTransplant}
          disabled={ !newVol }
          fullWidth
        >
          AGREGAR
        </Button>
      </Grid>
    </Layout>
  );
};

export default NewTransplant;
