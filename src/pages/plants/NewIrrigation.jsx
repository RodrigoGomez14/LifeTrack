import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  List,
  ListItemText,
  Select,
  MenuItem,
  Grid,
  ListItem,
  Paper,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Chip,
  Stack,
  Divider
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useStore } from "../../store";
import OpacityIcon from '@mui/icons-material/Opacity';
import ScienceIcon from '@mui/icons-material/Science';
import { useTheme } from '@mui/material/styles';

const NewIrrigation = () => {
  const {userData} = useStore()
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [quantity, setQuantity] = useState("");
  const [aditives, setAditives] = useState([]);
  const [selectedAditive, setSelectedAditive] = useState('');
  const [selectedDosis, setSelectedDosis] = useState('');

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
        aditives: aditives,
      });

    setQuantity("");
    setAditives([]);

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  const handleAddAditive = () => {
    let auxList = [...aditives];
    auxList.push({name:userData.plants.aditives.fertilizantes[selectedAditive].name,dosis:selectedDosis});
    setAditives(auxList);
    setSelectedAditive("");
    setSelectedDosis("");
  };

  return (
    <Layout title="Nuevo Riego">
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        p: { xs: 2, md: 0 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)'
      }}>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff'
          }}>
            <OpacityIcon fontSize="large" sx={{ color: '#ffffff' }} />
            <Typography variant="h5" component="h1" sx={{ color: '#ffffff' }}>
              Registrar Nuevo Riego
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Cantidad (ml)"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    ADITIVOS (OPCIONAL)
                  </Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Aditivos</InputLabel>
                  <Select
                    value={selectedAditive}
                    label="Aditivos"
                    onChange={(e) => setSelectedAditive(e.target.value)}
                  >
                    {Object.keys(userData.plants.aditives.fertilizantes).map(aditive => (
                      <MenuItem key={aditive} value={aditive}>
                        {userData.plants.aditives.fertilizantes[aditive].name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {selectedAditive && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Dosis</InputLabel>
                    <Select
                      value={selectedDosis}
                      label="Dosis"
                      onChange={(e) => {
                        setSelectedDosis(e.target.value)
                      }}
                    >
                      {userData.plants.aditives.fertilizantes[selectedAditive].dosis.map((dosis, index) => (
                        <MenuItem key={index} value={dosis.quantity}>
                          {dosis.quantity}{dosis.measure}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      color="info"
                      disabled={!selectedDosis}
                      onClick={handleAddAditive}
                      startIcon={<ScienceIcon />}
                      sx={{
                        color: theme.palette.info.main,
                        borderColor: theme.palette.info.main,
                        '&:hover': {
                          borderColor: theme.palette.info.dark,
                          bgcolor: alpha(theme.palette.info.main, 0.05)
                        }
                      }}
                    >
                      AGREGAR ADITIVO
                    </Button>
                  </Box>
                </Grid>
              )}
              
              {aditives.length > 0 && (
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Aditivos seleccionados:
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {aditives.map((ad, index) => (
                        <Chip 
                          key={index}
                          label={`${ad.name} - ${ad.dosis} ml/l`}
                          color="info"
                          variant="outlined"
                          sx={{ 
                            justifyContent: 'space-between',
                            borderColor: theme.palette.info.main,
                            color: theme.palette.info.main,
                            '& .MuiChip-deleteIcon': {
                              color: theme.palette.info.main
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              )}
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleNewIrrigation}
                  disabled={!quantity}
                  fullWidth
                  size="large"
                  sx={{ 
                    bgcolor: theme.palette.info.main,
                    color: '#ffffff',
                    py: 1.5,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
                    '&:hover': {
                      bgcolor: theme.palette.info.dark,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.info.main, 0.4)}`
                    }
                  }}
                >
                  GUARDAR RIEGO
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default NewIrrigation;
