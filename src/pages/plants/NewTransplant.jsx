import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Divider
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useStore } from "../../store";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useTheme } from '@mui/material/styles';

const NewTransplant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {userData} = useStore();
  const theme = useTheme();
  const [newVol, setNewVol] = useState("");
  
  // Obtener el volumen actual de la maceta
  const currentPlantId = checkSearch(location.search);
  const currentPlant = userData?.plants?.active?.[currentPlantId];
  const currentPotVolume = currentPlant?.potVolume || "No especificado";

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
    <Layout title="Nuevo Transplante">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, md: 0 } }}>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            bgcolor: alpha(theme.palette.warning.main, 0.1)
          }}>
            <SwapHorizIcon fontSize="large" color="warning" />
            <Typography variant="h5" component="h1">
              Registrar Nuevo Transplante
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Volumen actual de la maceta
                  </Typography>
                  <Typography variant="h6">
                    {currentPotVolume} litros
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    NUEVA MACETA
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Volumen de la nueva maceta (litros)"
                  type="number"
                  value={newVol}
                  onChange={(e) => setNewVol(e.target.value)}
                  required
                  fullWidth
                  helperText="Ingresa el volumen en litros"
                  InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleNewTransplant}
                  disabled={!newVol}
                  fullWidth
                  size="large"
                >
                  REGISTRAR TRANSPLANTE
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default NewTransplant;
