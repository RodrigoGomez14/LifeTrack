import React, {  useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Input,
  Select,
  MenuItem,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  ButtonGroup,
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Divider,
  Stack,
  Chip
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';

const NewAditive = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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
      <Box sx={{ 
        maxWidth: 800, 
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
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: '#ffffff'
          }}>
            <ScienceIcon fontSize="large" sx={{ color: '#ffffff' }} />
            <Typography variant="h5" component="h1" sx={{ color: '#ffffff' }}>
              Agregar Nuevo Aditivo
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ButtonGroup fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <Button 
                    onClick={() => setType('Fertilizante')} 
                    variant={type === 'Fertilizante' ? 'contained' : 'outlined'}
                    sx={{ 
                      ...(type === 'Fertilizante' ? {
                        bgcolor: theme.palette.success.main,
                        color: '#ffffff',
                        '&:hover': { bgcolor: theme.palette.success.dark }
                      } : {
                        color: theme.palette.success.main,
                        borderColor: theme.palette.success.main,
                        '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.08) }
                      })
                    }}
                  >
                    Fertilizante
                  </Button>
                  <Button 
                    onClick={() => setType('Insecticida')} 
                    variant={type === 'Insecticida' ? 'contained' : 'outlined'}
                    sx={{ 
                      ...(type === 'Insecticida' ? {
                        bgcolor: theme.palette.success.main,
                        color: '#ffffff',
                        '&:hover': { bgcolor: theme.palette.success.dark }
                      } : {
                        color: theme.palette.success.main,
                        borderColor: theme.palette.success.main,
                        '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.08) }
                      })
                    }}
                  >
                    Insecticida
                  </Button>
                </ButtonGroup>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={3}>
                  <TextField
                    label="Nombre"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Marca"
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                    fullWidth
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    DOSIS
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.8) }}>
                  <Grid container spacing={3} alignItems='center'>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel htmlFor="Etapa">Etapa</InputLabel>
                        <Input
                          id='Etapa'
                          label="Etapa"
                          type="text"
                          value={dosisName}
                          onChange={(e) => setDosisName(e.target.value)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel htmlFor="Dosis">Dosis</InputLabel>
                        <Input
                          id='Dosis'
                          label="Dosis"
                          type="number"
                          value={dosis}
                          onChange={(e) => setDosis(e.target.value)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth>
                        <InputLabel>Medida</InputLabel>
                        <Select
                          value={dosisMeasure}
                          label="Medida"
                          onChange={(e) => setDosisMeasure(e.target.value)}
                        >
                          <MenuItem value='Ml/L'>Ml/L</MenuItem>
                          <MenuItem value='Grs/L'>Grs/L</MenuItem>
                          <MenuItem value='Cm3/L'>Cm3/L</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        variant="contained"
                        onClick={handleAddDosis}
                        disabled={!dosisName || !dosis || !dosisMeasure }
                        fullWidth
                        sx={{ 
                          bgcolor: theme.palette.secondary.main,
                          '&:hover': { bgcolor: theme.palette.secondary.dark }
                        }}
                      >
                        Agregar Dosis
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {dosisList.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Dosis agregadas:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                        {dosisList.map((item, index) => (
                          <Chip 
                            key={index}
                            label={`${item.name}: ${item.quantity} ${item.measure}`}
                            sx={{ 
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              m: 0.5
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNewAditive}
                  fullWidth
                  disabled={!type || !name || !brand || !dosisList.length }
                  size="large"
                  startIcon={<AddIcon />}
                  sx={{ 
                    bgcolor: theme.palette.secondary.main,
                    color: '#ffffff',
                    py: 1.5,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    '&:hover': {
                      bgcolor: theme.palette.secondary.dark,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`
                    }
                  }}
                >
                  Agregar Aditivo
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default NewAditive;
