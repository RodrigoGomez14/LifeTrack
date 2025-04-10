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
import { useTheme } from '@mui/material/styles';
import BugReportIcon from '@mui/icons-material/BugReport';
import SaveIcon from '@mui/icons-material/Save';

const NewInsecticide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
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
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        p: { xs: 2, md: 0 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)'
      }}>
        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff'
          }}>
            <BugReportIcon fontSize="large" sx={{ color: '#ffffff' }} />
            <Typography variant="h5" component="h1" sx={{ color: '#ffffff' }}>
              Registrar Nuevo Insecticida
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Producto"
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    MÉTODO DE APLICACIÓN
                  </Typography>
                </Divider>
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
                  size="large"
                  startIcon={<SaveIcon />}
                  sx={{ 
                    bgcolor: theme.palette.error.main,
                    color: '#ffffff',
                    py: 1.5,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                    '&:hover': {
                      bgcolor: theme.palette.error.dark,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`
                    }
                  }}
                >
                  Guardar Insecticida
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default NewInsecticide;
