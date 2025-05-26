import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Grid, 
  Button, 
  Tab, 
  Tabs, 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Container,
  Fab,
  alpha,
  Paper,
  Divider,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CardHeader,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import AddIcon from '@mui/icons-material/Add';
import ScienceIcon from '@mui/icons-material/Science';
import BugReportIcon from '@mui/icons-material/BugReport';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';

const Aditives = () => {
  const { userData } = useStore();
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Obtener conteos para los badges
  const fertilizantesCount = userData?.plants?.aditives?.fertilizantes 
    ? Object.keys(userData.plants.aditives.fertilizantes).length 
    : 0;
  
  const insecticidasCount = userData?.plants?.aditives?.insecticidas 
    ? Object.keys(userData.plants.aditives.insecticidas).length 
    : 0;

  // Componente personalizado para mostrar un aditivo con mejoras visuales
  const EnhancedAditiveAccordion = ({ aditive, type }) => {
    const isInsecticide = type === 'insecticida';
    // Usar siempre el color primario del tema (mismo que el header)
    const primaryColor = theme.palette.primary.main;
    const secondaryColor = theme.palette.primary.light;
    
    return (
      <Accordion 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          '&:before': { display: 'none' },
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
          width: '100%',
          border: `1px solid ${alpha(primaryColor, 0.2)}`,
          mb: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 24px ${alpha(primaryColor, 0.15)}`
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff',
            minHeight: 64,
            '& .MuiAccordionSummary-content': {
              margin: '16px 0',
              alignItems: 'center'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Avatar 
              sx={{ 
                bgcolor: alpha('#ffffff', 0.25),
                color: '#ffffff',
                width: 48,
                height: 48,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {isInsecticide ? <BugReportIcon sx={{ fontSize: 24 }} /> : <ScienceIcon sx={{ fontSize: 24 }} />}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold" color="inherit" sx={{ mb: 0.5 }}>
                {aditive.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip 
                  label={aditive.brand} 
                  size="small"
                  sx={{ 
                    bgcolor: alpha('#ffffff', 0.2),
                    color: '#ffffff',
                    fontWeight: 'medium',
                    fontSize: '0.75rem'
                  }}
                />
                <Chip 
                  label={aditive.type} 
                  size="small"
                  sx={{ 
                    bgcolor: alpha('#ffffff', 0.15),
                    color: '#ffffff',
                    fontWeight: 'medium',
                    fontSize: '0.75rem'
                  }}
                />
              </Stack>
            </Box>

          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{ 
            bgcolor: alpha(primaryColor, 0.02),
            borderTop: `1px solid ${alpha(primaryColor, 0.1)}`
          }}>
            {aditive.dosis && aditive.dosis.length > 0 ? (
              <List disablePadding>
                {aditive.dosis.map((dosis, index) => (
                  <ListItem 
                    key={index}
                    divider={index < aditive.dosis.length - 1}
                    sx={{ 
                      py: 3, 
                      px: 3,
                      position: 'relative',
                      '&:hover': {
                        bgcolor: alpha(primaryColor, 0.05)
                      },
                      borderLeft: `4px solid ${primaryColor}`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Grid container alignItems="center" spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40,
                              bgcolor: alpha(primaryColor, 0.15),
                              color: primaryColor,
                              fontWeight: 'bold',
                              fontSize: '1.1rem'
                            }}
                          >
                            {dosis.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                              Etapa de crecimiento
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                              {dosis.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          textAlign: { xs: 'left', sm: 'center' },
                          mt: { xs: 2, sm: 0 }
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                            Dosificación recomendada
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                            <Typography variant="h4" fontWeight="bold" color={primaryColor}>
                              {dosis.quantity}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" fontWeight="medium">
                              {dosis.measure}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      

                    </Grid>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No hay dosis configuradas para este {isInsecticide ? 'insecticida' : 'fertilizante'}
                </Typography>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  // Componente para estado vacío
  const EmptyState = ({ type }) => {
    const isInsecticide = type === 'insecticida';
    const icon = isInsecticide ? <BugReportIcon /> : <LocalFloristIcon />;
    const title = isInsecticide ? 'No hay insecticidas registrados' : 'No hay fertilizantes registrados';
    const description = isInsecticide 
      ? 'Agrega tu primer insecticida para comenzar a hacer seguimiento de tratamientos'
      : 'Agrega tu primer fertilizante para comenzar a hacer seguimiento de nutrición';
    const buttonText = isInsecticide ? 'Agregar Insecticida' : 'Agregar Fertilizante';
    // Usar siempre el color primario del tema (mismo que el header)
    const color = theme.palette.primary.main;

    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          p: 6,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
          borderRadius: 3,
          border: `2px dashed ${alpha(color, 0.3)}`,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.03)}`
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: alpha(color, 0.1),
            color: alpha(color, 0.7),
            mx: 'auto',
            mb: 3
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 40 } })}
        </Avatar>
        
        <Typography variant="h5" color="text.primary" gutterBottom fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
          {description}
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link}
          to="/NuevoAditivo"
          size="large"
          sx={{
            bgcolor: color,
            color: '#ffffff',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            boxShadow: `0 6px 16px ${alpha(color, 0.3)}`,
            '&:hover': {
              bgcolor: alpha(color, 0.9),
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 20px ${alpha(color, 0.4)}`
            },
            transition: 'all 0.3s ease',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          {buttonText}
        </Button>
      </Box>
    );
  };

  return (
    <Layout title="Aditivos">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Header principal */}
        <Box sx={{ mb: 4, mt: { xs: 6, sm: 8 } }}>
          <Card 
            elevation={4} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              mb: 4,
              position: 'relative',
              minHeight: '140px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: '#ffffff'
            }}
          >
            {/* Overlay decorativo */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
              backdropFilter: 'blur(1px)'
            }} />
            
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1, minHeight: '140px', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  justifyContent: 'space-between',
                  gap: { xs: 2, md: 3 }
                }}>
                  {/* Título y descripción */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha('#ffffff', 0.2), 
                        color: '#ffffff',
                        width: 64,
                        height: 64,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    >
                      <ScienceIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 'bold',
                          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          fontSize: { xs: '2rem', md: '2.5rem' },
                          lineHeight: 1.1,
                          mb: 1
                        }}
                      >
                        Aditivos
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          opacity: 0.9,
                          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                          fontWeight: 'normal'
                        }}
                      >
                        Gestiona fertilizantes e insecticidas
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Estadísticas */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 3,
                    alignItems: 'center'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        {fertilizantesCount}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Fertilizantes
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      width: '1px', 
                      height: '40px', 
                      bgcolor: alpha('#ffffff', 0.3)
                    }} />
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        {insecticidasCount}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Insecticidas
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Navegación con tabs mejorada */}
        <Paper 
          elevation={3}
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            mb: 4,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleChange}
            variant="fullWidth"
            textColor="inherit"
            sx={{ 
              bgcolor: theme.palette.background.paper,
              '& .MuiTab-root': {
                py: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'text.secondary',
                transition: 'all 0.3s ease',
                minHeight: 80,
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                },
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '2px 2px 0 0',
                backgroundColor: theme.palette.primary.main
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocalFloristIcon sx={{ fontSize: 28 }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Fertilizantes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Nutrición de plantas
                    </Typography>
                  </Box>

                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <BugReportIcon sx={{ fontSize: 28 }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Insecticidas
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Control de plagas
                    </Typography>
                  </Box>

                </Box>
              }
            />
          </Tabs>
        </Paper>

        {/* Contenido principal */}
        <Box sx={{ minHeight: '400px' }}>
          {tabValue === 0 ? (
            // Fertilizantes
            <>
              {userData?.plants?.aditives?.fertilizantes && Object.keys(userData.plants.aditives.fertilizantes).length > 0 ? (
                <Box>
                  {/* Header de sección */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                        Fertilizantes registrados
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {Object.keys(userData.plants.aditives.fertilizantes).length} fertilizante{Object.keys(userData.plants.aditives.fertilizantes).length !== 1 ? 's' : ''} disponible{Object.keys(userData.plants.aditives.fertilizantes).length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      component={Link}
                      to="/NuevoAditivo"
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: '#ffffff',
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Nuevo Fertilizante
                    </Button>
                  </Box>
                  
                  {/* Lista de fertilizantes */}
                  <Stack spacing={0}>
                    {Object.keys(userData.plants.aditives.fertilizantes).map(fertilizante => (
                      <EnhancedAditiveAccordion 
                        key={fertilizante} 
                        aditive={userData.plants.aditives.fertilizantes[fertilizante]}
                        type="fertilizante"
                      />
                    ))}
                  </Stack>
                </Box>
              ) : (
                <EmptyState type="fertilizante" />
              )}
            </>
          ) : (
            // Insecticidas
            <>
              {userData?.plants?.aditives?.insecticidas && Object.keys(userData.plants.aditives.insecticidas).length > 0 ? (
                <Box>
                  {/* Header de sección */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                        Insecticidas registrados
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {Object.keys(userData.plants.aditives.insecticidas).length} insecticida{Object.keys(userData.plants.aditives.insecticidas).length !== 1 ? 's' : ''} disponible{Object.keys(userData.plants.aditives.insecticidas).length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      component={Link}
                      to="/NuevoAditivo"
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: '#ffffff',
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Nuevo Insecticida
                    </Button>
                  </Box>
                  
                  {/* Lista de insecticidas */}
                  <Stack spacing={0}>
                    {Object.keys(userData.plants.aditives.insecticidas).map(insecticida => (
                      <EnhancedAditiveAccordion 
                        key={insecticida} 
                        aditive={userData.plants.aditives.insecticidas[insecticida]}
                        type="insecticida"
                      />
                    ))}
                  </Stack>
                </Box>
              ) : (
                <EmptyState type="insecticida" />
              )}
            </>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default Aditives;