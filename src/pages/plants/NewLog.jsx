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
import { useTheme } from '@mui/material/styles';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

const NewLog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [description, setDescription] = useState("");
  const [logDate, setLogDate] = useState(new Date());

  const formatDate = (date) => {
    if (!date) return getDate();
    
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleNewLog = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/logs`
      )
      .push({
        date: formatDate(logDate),
        description: description,
        timestamp: Date.now()
      });

    setDescription("");
    setLogDate(new Date());

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  return (
    <Layout title="Nuevo Registro">
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
            <NoteAltIcon fontSize="large" sx={{ color: '#ffffff' }} />
            <Typography variant="h5" component="h1" sx={{ color: '#ffffff' }}>
              Añadir Nuevo Registro
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Fecha del registro"
                    value={logDate}
                    onChange={(date) => setLogDate(date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    DESCRIPCIÓN
                  </Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  placeholder="Escribe los detalles de tu registro aquí..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  fullWidth
                  multiline
                  rows={6}
                  helperText="Puedes registrar cualquier evento, observación o detalle relevante sobre tu planta"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNewLog}
                  disabled={!description.trim()}
                  fullWidth
                  size="large"
                  sx={{ 
                    bgcolor: '#9c27b0',
                    color: '#ffffff',
                    py: 1.5,
                    boxShadow: `0 4px 12px ${alpha('#9c27b0', 0.3)}`,
                    '&:hover': {
                      bgcolor: '#7b1fa2',
                      boxShadow: `0 6px 16px ${alpha('#9c27b0', 0.4)}`
                    }
                  }}
                >
                  GUARDAR REGISTRO
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default NewLog; 