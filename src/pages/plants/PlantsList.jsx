import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Grid, 
  Button, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea, 
  Fab, 
  Chip,
  Paper,
  TextField,
  InputAdornment,
  Divider,
  IconButton,
  alpha
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ForestIcon from '@mui/icons-material/Forest';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SpaIcon from '@mui/icons-material/Spa';
import FilterListIcon from '@mui/icons-material/FilterList';
import ScienceIcon from '@mui/icons-material/Science';
import { useTheme } from '@mui/material/styles';

const PlantsList = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar plantas según término de búsqueda
  const filteredPlants = userData?.plants?.active 
    ? Object.entries(userData.plants.active)
      .filter(([id, plant]) => plant.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
    : [];

  // Función para obtener un ícono aleatorio para las plantas que no tienen imágenes
  const getPlantIcon = (index) => {
    const icons = [
      <GrassIcon fontSize="large" />,
      <LocalFloristIcon fontSize="large" />,
      <SpaIcon fontSize="large" />
    ];
    return icons[index % icons.length];
  };

  // Función para obtener estadísticas de una planta
  const getPlantStats = (plant) => {
    const stats = [
      { 
        label: 'Riegos', 
        value: plant.irrigations ? Object.keys(plant.irrigations).length : 0,
        icon: <WaterDropIcon sx={{ fontSize: 16 }} />,
        color: theme.palette.info.main
      },
      { 
        label: 'Podas', 
        value: plant.prunings ? Object.keys(plant.prunings).length : 0,
        icon: <ScienceIcon sx={{ fontSize: 16 }} />,
        color: theme.palette.success.main
      }
    ];
    return stats;
  };

  return (
    <Layout title="Mis Plantas">
      <Box sx={{ mb: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
            borderRadius: 2
          }}
        >
          <TextField
            placeholder="Buscar plantas..."
            variant="outlined"
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 1 }}
          />
          <IconButton size="small">
            <FilterListIcon />
          </IconButton>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<ScienceIcon />}
            component={Link}
            to="/Aditivos"
            sx={{ borderRadius: 2 }}
          >
            Ver Aditivos
          </Button>
          
          <Fab 
            color="primary" 
            aria-label="add" 
            component={Link}
            to="/NuevaPlanta"
            size="medium"
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {userData?.plants ? (
        <>
          <Typography variant="h6" gutterBottom sx={{ 
            ml: 1, 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 'medium' 
          }}>
            <ForestIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
            Plantas Activas ({filteredPlants.length})
          </Typography>
          
          <Grid container spacing={2}>
            {filteredPlants.map(([id, plant], index) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardActionArea 
                    component={Link}
                    to={`/Planta/?${id}`}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <Box sx={{ 
                      height: 140, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main
                    }}>
                      {plant.images && Object.keys(plant.images).length > 0 ? (
                        <CardMedia
                          component="img"
                          height="140"
                          image={plant.images[Object.keys(plant.images)[0]].url}
                          alt={plant.name}
                        />
                      ) : getPlantIcon(index)}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {plant.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <Chip 
                          label={`${plant.quantity} unidades`} 
                          size="small" 
                          sx={{ mr: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                        />
                        {plant.potVolume && (
                          <Chip 
                            label={`${plant.potVolume}L`} 
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
                          />
                        )}
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
                        {getPlantStats(plant).map((stat, idx) => (
                          <Box key={idx} sx={{ textAlign: 'center' }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mb: 0.5,
                              color: stat.color
                            }}>
                              {stat.icon}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {stat.value} {stat.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {filteredPlants.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              p: 4, 
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: `1px dashed ${theme.palette.divider}`
            }}>
              <ForestIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No se encontraron plantas
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {searchTerm ? 'Intenta con otra búsqueda' : 'Agrega tu primera planta para comenzar'}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                component={Link}
                to="/NuevaPlanta"
              >
                Agregar Planta
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          p: 4, 
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: `1px dashed ${theme.palette.divider}`
        }}>
          <ForestIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aún no tienes plantas
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Agrega tu primera planta para comenzar a hacer seguimiento
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            component={Link}
            to="/NuevaPlanta"
          >
            Agregar Planta
          </Button>
        </Box>
      )}
    </Layout>
  );
};

export default PlantsList;
