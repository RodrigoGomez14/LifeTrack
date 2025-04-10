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
  Avatar
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import AddIcon from '@mui/icons-material/Add';
import ScienceIcon from '@mui/icons-material/Science';
import BugReportIcon from '@mui/icons-material/BugReport';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';

const Aditives = () => {
  const { userData } = useStore();
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Componente personalizado para mostrar un aditivo con mejoras visuales
  const EnhancedAditiveAccordion = ({ aditive }) => {
    return (
      <Accordion 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          '&:before': { display: 'none' },
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.07)}`,
          width: '100%',
          bgcolor: '#2c2c2c'
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff',
            minHeight: 56,
            '& .MuiAccordionSummary-content': {
              margin: '12px 0'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              sx={{ 
                bgcolor: alpha('#ffffff', 0.2),
                color: '#ffffff',
                width: 36,
                height: 36,
              }}
            >
              <ScienceIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" color="inherit">
                {aditive.name}
              </Typography>
              <Typography variant="caption" color={alpha('#ffffff', 0.85)}>
                {aditive.brand} • {aditive.type}
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{ p: 2, bgcolor: '#2c2c2c' }}>
            <Typography variant="subtitle2" color="#ffffff" gutterBottom sx={{ pl: 2 }}>
              Dosis:
            </Typography>
            
            <List disablePadding>
              {aditive.dosis && aditive.dosis.map((dosis, index) => (
                <ListItem 
                  key={index}
                  divider={index < aditive.dosis.length - 1}
                  sx={{ 
                    py: 2, 
                    px: 2,
                    borderRadius: index === aditive.dosis.length - 1 ? '0 0 8px 8px' : 0,
                    position: 'relative',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15)
                    },
                    borderLeft: `4px solid ${
                      tabValue === 0 
                        ? theme.palette.primary.main 
                        : theme.palette.error.main
                    }`,
                    borderBottom: index < aditive.dosis.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    transition: 'all 0.2s ease',
                    bgcolor: alpha(
                      tabValue === 0 ? theme.palette.primary.main : theme.palette.error.main, 
                      0.05
                    )
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32,
                            bgcolor: alpha(
                              tabValue === 0 ? theme.palette.primary.main : theme.palette.error.main, 
                              0.2
                            ),
                            color: tabValue === 0 ? theme.palette.primary.main : theme.palette.error.main
                          }}
                        >
                          {dosis.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" fontSize="0.75rem">
                            Etapa:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="#ffffff">
                            {dosis.name}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        mt: { xs: 1, sm: 0 }
                      }}>
                        <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" fontSize="0.75rem">
                          Cantidad:
                        </Typography>
                        <Typography variant="h6" fontWeight="medium" color="#ffffff">
                          {dosis.quantity} <Typography component="span" variant="caption" color="rgba(255, 255, 255, 0.7)">{dosis.measure}</Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ 
                      display: 'flex', 
                      justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                      mt: { xs: 1, sm: 0 } 
                    }}>
                      <Chip 
                        label={`${dosis.quantity} ${dosis.measure}`}
                        size="medium"
                        icon={
                          tabValue === 0 
                            ? <ScienceIcon fontSize="small" /> 
                            : <BugReportIcon fontSize="small" />
                        }
                        sx={{ 
                          bgcolor: alpha(
                            tabValue === 0 ? theme.palette.primary.main : theme.palette.error.main, 
                            0.15
                          ),
                          color: tabValue === 0 ? theme.palette.primary.main : theme.palette.error.main,
                          fontWeight: 'medium',
                          '& .MuiChip-icon': {
                            color: 'inherit'
                          },
                          px: 1,
                          borderRadius: '16px'
                        }}
                      />
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Layout title="Aditivos">
      <Box 
        sx={{ 
          minHeight: '100vh',
          width: '100%',
          pt: 2,
          pb: 4
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2 } }}>
          <Card 
            elevation={3} 
            sx={{ 
              mt: 2,
              mb: 3, 
              borderRadius: 3, 
              overflow: 'hidden',
              bgcolor: 'white',
              boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.1)}`,
              width: '100%'
            }}
          >
            <CardContent sx={{
              p: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: '#ffffff',
            }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ScienceIcon fontSize="large" sx={{ color: '#ffffff' }} />
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#ffffff' }}>
                    Mis Aditivos
                  </Typography>
                </Box>
                
                <Fab 
                  color="primary" 
                  aria-label="add" 
                  component={Link}
                  to="/NuevoAditivo"
                  size="medium"
                  sx={{
                    bgcolor: alpha('#ffffff', 0.2),
                    color: '#ffffff',
                    boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.15)}`,
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.3),
                      boxShadow: `0 10px 20px ${alpha(theme.palette.common.black, 0.2)}`
                    }
                  }}
                >
                  <AddIcon />
                </Fab>
              </Stack>
            </CardContent>
          </Card>
          
          <Paper 
            elevation={3}
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              mb: 4,
              width: '100%'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleChange}
              variant="fullWidth"
              textColor="inherit"
              sx={{ 
                '& .Mui-selected': {
                  color: tabValue === 0 ? '#4caf50' : '#f44336' 
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: tabValue === 0 ? '#4caf50' : '#f44336'
                },
                '& .MuiTab-root': {
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'rgba(255, 255, 255, 0.9)'
                  },
                  '&.Mui-selected': {
                    color: tabValue === 0 ? '#4caf50' : '#f44336'
                  }
                }
              }}
            >
              <Tab 
                label="FERTILIZANTES" 
                icon={<LocalFloristIcon />} 
                iconPosition="start"
                sx={{ color: 'white' }}
              />
              <Tab 
                label="INSECTICIDAS" 
                icon={<BugReportIcon />}
                iconPosition="start"
                sx={{ color: 'white' }}
              />
        </Tabs>
            
            <Box sx={{ p: 2, minHeight: '300px' }}>
              {tabValue === 0 ? (
                <>
                  {userData?.plants?.aditives?.fertilizantes && Object.keys(userData.plants.aditives.fertilizantes).length > 0 ? (
                    <Stack spacing={2}>
            {Object.keys(userData.plants.aditives.fertilizantes).map(fertilizante => (
                        <EnhancedAditiveAccordion 
                          key={fertilizante} 
                          aditive={userData.plants.aditives.fertilizantes[fertilizante]} 
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        p: 4,
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.divider, 0.8)}`,
                      }}
                    >
                      <LocalFloristIcon sx={{ fontSize: 60, color: alpha(theme.palette.secondary.main, 0.2), mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay fertilizantes registrados
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Agrega tu primer fertilizante para comenzar a hacer seguimiento
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        component={Link}
                        to="/NuevoAditivo"
                        sx={{
                          bgcolor: theme.palette.secondary.main,
                          color: '#ffffff',
                          borderRadius: 8,
                          px: 3,
                          py: 1,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.25)}`,
                          '&:hover': {
                            bgcolor: theme.palette.secondary.dark
                          }
                        }}
                      >
                        Agregar Fertilizante
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  {userData?.plants?.aditives?.insecticidas && Object.keys(userData.plants.aditives.insecticidas).length > 0 ? (
                    <Stack spacing={2}>
            {Object.keys(userData.plants.aditives.insecticidas).map(insecticida => (
                        <EnhancedAditiveAccordion 
                          key={insecticida} 
                          aditive={userData.plants.aditives.insecticidas[insecticida]} 
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        p: 4,
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.divider, 0.8)}`,
                      }}
                    >
                      <BugReportIcon sx={{ fontSize: 60, color: alpha(theme.palette.secondary.main, 0.2), mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay insecticidas registrados
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Agrega tu primer insecticida para comenzar a hacer seguimiento
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        component={Link}
                        to="/NuevoAditivo"
                        sx={{
                          bgcolor: theme.palette.secondary.main,
                          color: '#ffffff',
                          borderRadius: 8,
                          px: 3,
                          py: 1,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.25)}`,
                          '&:hover': {
                            bgcolor: theme.palette.secondary.dark
                          }
                        }}
                      >
                        Agregar Insecticida
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
};

export default Aditives;