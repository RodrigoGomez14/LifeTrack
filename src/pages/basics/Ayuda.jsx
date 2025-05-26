import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Stack,
  Avatar,
  Chip,
  Fade,
  useMediaQuery,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// Iconos
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import NatureIcon from '@mui/icons-material/Nature';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

function Ayuda() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCategory, setSelectedCategory] = useState('intro');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Categorías de ayuda
  const helpCategories = [
    {
      id: 'intro',
      title: 'Introducción',
      icon: <HelpOutlineIcon />,
      color: theme.palette.primary.main,
      description: 'Primeros pasos con LifeTrack'
    },
    {
      id: 'finances',
      title: 'Finanzas',
      icon: <AccountBalanceWalletIcon />,
      color: theme.palette.success.main,
      description: 'Gestión de gastos e ingresos'
    },
    {
      id: 'cards',
      title: 'Tarjetas',
      icon: <CreditCardIcon />,
      color: theme.palette.warning.main,
      description: 'Control de tarjetas de crédito'
    },
    {
      id: 'habits',
      title: 'Hábitos',
      icon: <EmojiEventsIcon />,
      color: theme.palette.info.main,
      description: 'Seguimiento de rutinas'
    },
    {
      id: 'plants',
      title: 'Plantas',
      icon: <NatureIcon />,
      color: '#4caf50',
      description: 'Cuidado de plantas'
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: <SettingsIcon />,
      color: theme.palette.secondary.main,
      description: 'Personalización y ajustes'
    },
    {
      id: 'tips',
      title: 'Consejos',
      icon: <LightbulbIcon />,
      color: '#ff9800',
      description: 'Mejores prácticas'
    }
  ];

  // Componente para tarjetas de características
  const FeatureCard = ({ title, description, icon, color, features }) => (
    <Card 
      elevation={3}
      sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.2)}`
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
          color: 'white'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: alpha('#ffffff', 0.2),
              color: 'white',
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {description}
            </Typography>
          </Box>
        </Stack>
      </Box>
      
      <CardContent sx={{ p: 3 }}>
        <List disablePadding>
          {features.map((feature, index) => (
            <ListItem key={index} disablePadding sx={{ mb: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon sx={{ color: color, fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary={feature}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 'medium'
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  // Componente para secciones expandibles
  const ExpandableSection = ({ id, title, icon, children, color }) => {
    const isExpanded = expandedSections[id];
    
    return (
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          mb: 2,
          border: `1px solid ${alpha(color, 0.2)}`
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color }}>
              {icon}
            </Avatar>
          }
          title={title}
          action={
            <IconButton onClick={() => toggleSection(id)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          }
          sx={{
            bgcolor: alpha(color, 0.05),
            cursor: 'pointer',
            '&:hover': {
              bgcolor: alpha(color, 0.1)
            }
          }}
          onClick={() => toggleSection(id)}
        />
        <Collapse in={isExpanded}>
          <CardContent sx={{ p: 3 }}>
            {children}
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  // Contenido para cada categoría
  const renderContent = () => {
    switch (selectedCategory) {
      case 'intro':
        return (
          <Fade in timeout={600}>
            <Box>
              {/* Header de bienvenida */}
              <Card 
                elevation={4}
                sx={{ 
                  borderRadius: 4,
                  overflow: 'hidden',
                  mb: 4,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: alpha('#ffffff', 0.2),
                        color: 'white',
                        width: 80,
                        height: 80
                      }}
                    >
                      <RocketLaunchIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        ¡Bienvenido a LifeTrack!
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        Tu asistente personal para finanzas, hábitos y más
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Características principales */}
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Características principales
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <FeatureCard
                    title="Gestión Financiera"
                    description="Control total de tus finanzas"
                    icon={<MonetizationOnIcon />}
                    color={theme.palette.success.main}
                    features={[
                      'Registro de gastos e ingresos',
                      'Control de tarjetas de crédito',
                      'Seguimiento de ahorros',
                      'Reportes detallados'
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FeatureCard
                    title="Seguimiento de Hábitos"
                    description="Mejora tu calidad de vida"
                    icon={<EmojiEventsIcon />}
                    color={theme.palette.info.main}
                    features={[
                      'Creación de hábitos personalizados',
                      'Seguimiento diario',
                      'Estadísticas de progreso',
                      'Recordatorios inteligentes'
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FeatureCard
                    title="Personalización"
                    description="Adapta la app a tu estilo"
                    icon={<PaletteIcon />}
                    color={theme.palette.secondary.main}
                    features={[
                      'Temas personalizados',
                      'Configuración avanzada',
                      'Interfaz adaptable',
                      'Modo oscuro/claro'
                    ]}
                  />
                </Grid>
              </Grid>

              {/* Primeros pasos */}
              <Card elevation={2} sx={{ borderRadius: 3, p: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <AutoAwesomeIcon sx={{ color: theme.palette.warning.main }} />
                  <Typography variant="h6" fontWeight="600">
                    Primeros pasos recomendados
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label="1" size="small" color="warning" />
                      <Typography variant="body1" fontWeight="medium">
                        Configura tus categorías de gastos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label="2" size="small" color="warning" />
                      <Typography variant="body1" fontWeight="medium">
                        Registra tus primeros gastos e ingresos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label="3" size="small" color="warning" />
                      <Typography variant="body1" fontWeight="medium">
                        Agrega tus tarjetas de crédito
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label="4" size="small" color="warning" />
                      <Typography variant="body1" fontWeight="medium">
                        Crea tus primeros hábitos
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Box>
          </Fade>
        );

      case 'finances':
        return (
          <Fade in timeout={600}>
            <Box>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Gestión de Finanzas
              </Typography>

              <ExpandableSection
                id="dashboard"
                title="Panel de Finanzas"
                icon={<BarChartIcon />}
                color={theme.palette.success.main}
              >
                <Typography variant="body1" paragraph>
                  El panel de finanzas es tu centro de control financiero donde puedes:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Ver resumen mensual"
                      secondary="Visualiza tus gastos e ingresos del mes actual con gráficos interactivos"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Analizar por categorías"
                      secondary="Entiende mejor tus hábitos financieros con análisis detallados"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Filtrar por períodos"
                      secondary="Navega entre diferentes meses para comparar tu evolución"
                    />
                  </ListItem>
                </List>
              </ExpandableSection>

              <ExpandableSection
                id="transactions"
                title="Registro de Transacciones"
                icon={<MonetizationOnIcon />}
                color={theme.palette.primary.main}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), p: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <TrendingDownIcon color="error" />
                        <Typography variant="h6">Registrar Gasto</Typography>
                      </Stack>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="1. Pulsa '+' → 'Nuevo Gasto'" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="2. Ingresa monto y descripción" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="3. Selecciona categoría" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="4. Elige método de pago" />
                        </ListItem>
                      </List>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.05), p: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <TrendingUpIcon color="success" />
                        <Typography variant="h6">Registrar Ingreso</Typography>
                      </Stack>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="1. Pulsa '+' → 'Nuevo Ingreso'" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="2. Ingresa monto y descripción" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="3. Selecciona fuente" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="4. Configura ahorros" />
                        </ListItem>
                      </List>
                    </Card>
                  </Grid>
                </Grid>
              </ExpandableSection>

              <ExpandableSection
                id="savings"
                title="Evolución de Ahorros"
                icon={<AccountBalanceWalletIcon />}
                color={theme.palette.info.main}
              >
                <Typography variant="body1" paragraph>
                  El seguimiento de ahorros te permite visualizar tu progreso financiero:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Gráfico de evolución histórica"
                      secondary="Visualiza cómo cambian tus ahorros día a día"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Metas de ahorro"
                      secondary="Establece objetivos y monitorea tu progreso"
                    />
                  </ListItem>
                </List>
              </ExpandableSection>
            </Box>
          </Fade>
        );

      case 'cards':
        return (
          <Fade in timeout={600}>
            <Box>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Gestión de Tarjetas de Crédito
              </Typography>

              <ExpandableSection
                id="card-management"
                title="Administración de Tarjetas"
                icon={<CreditCardIcon />}
                color={theme.palette.warning.main}
              >
                <Typography variant="body1" paragraph>
                  Gestiona todas tus tarjetas de crédito en un solo lugar:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Registro de tarjetas"
                      secondary="Agrega tarjetas con información básica y límites"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Control de gastos por tarjeta"
                      secondary="Visualiza gastos agrupados por período de facturación"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Gestión de fechas importantes"
                      secondary="Actualiza fechas de cierre y vencimiento mensualmente"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Subida de resúmenes PDF"
                      secondary="Mantén toda la información organizada en un solo lugar"
                    />
                  </ListItem>
                </List>
              </ExpandableSection>

              <Card elevation={2} sx={{ borderRadius: 3, p: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <TipsAndUpdatesIcon sx={{ color: theme.palette.warning.main }} />
                  <Typography variant="h6" fontWeight="600">
                    Consejo Profesional
                  </Typography>
                </Stack>
                <Typography variant="body1">
                  Utiliza el botón "Pagar Todas las Tarjetas" cuando llegue el vencimiento para registrar automáticamente los pagos como gastos y mantener tus saldos actualizados.
                </Typography>
              </Card>
            </Box>
          </Fade>
        );

      case 'habits':
        return (
          <Fade in timeout={600}>
            <Box>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Seguimiento de Hábitos
              </Typography>

              <ExpandableSection
                id="habit-creation"
                title="Crear y Gestionar Hábitos"
                icon={<FormatListBulletedIcon />}
                color={theme.palette.info.main}
              >
                <Typography variant="body1" paragraph>
                  La sección de hábitos te permite crear y dar seguimiento a rutinas:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Crear nuevos hábitos"
                      secondary="Define hábitos con nombre, descripción y frecuencia"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Registrar cumplimiento"
                      secondary="Marca hábitos como completados para mantener registro"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Visualizar estadísticas"
                      secondary="Revisa tu desempeño con gráficos y rachas"
                    />
                  </ListItem>
                </List>
              </ExpandableSection>

              <Card elevation={2} sx={{ borderRadius: 3, p: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <TipsAndUpdatesIcon sx={{ color: theme.palette.info.main }} />
                  <Typography variant="h6" fontWeight="600">
                    Consejo Profesional
                  </Typography>
                </Stack>
                <Typography variant="body1">
                  Comienza con 2-3 hábitos simples y ve aumentando gradualmente. Es mejor tener consistencia en pocos hábitos que intentar cambiar todo a la vez.
                </Typography>
              </Card>
            </Box>
          </Fade>
        );

      case 'plants':
        return (
          <Fade in timeout={600}>
            <Box>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Cuidado de Plantas
              </Typography>

              <ExpandableSection
                id="plant-management"
                title="Gestión de Plantas"
                icon={<NatureIcon />}
                color="#4caf50"
              >
                <Typography variant="body1" paragraph>
                  La sección de plantas te permite llevar un registro detallado:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Registrar plantas"
                      secondary="Agrega plantas con nombre, especie y ubicación"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Calendarios de riego"
                      secondary="Establece recordatorios basados en necesidades específicas"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Registro de cuidados"
                      secondary="Documenta riegos, fertilizaciones y trasplantes"
                    />
                  </ListItem>
                </List>
              </ExpandableSection>
            </Box>
          </Fade>
        );

      case 'settings':
        return (
          <Fade in timeout={600}>
            <Box>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Configuración y Personalización
              </Typography>

              <ExpandableSection
                id="theme-customization"
                title="Personalización del Tema"
                icon={<PaletteIcon />}
                color={theme.palette.secondary.main}
              >
                <Typography variant="body1" paragraph>
                  Personaliza la apariencia de LifeTrack:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Temas predefinidos"
                      secondary="Selecciona entre varios temas con combinaciones armoniosas"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Modo oscuro/claro"
                      secondary="Activa el modo oscuro para reducir fatiga visual"
                    />
                  </ListItem>
                </List>
              </ExpandableSection>

              <ExpandableSection
                id="privacy-settings"
                title="Configuración de Privacidad"
                icon={<SecurityIcon />}
                color={theme.palette.error.main}
              >
                <Typography variant="body1" paragraph>
                  Gestiona la privacidad y seguridad de tus datos:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Copias de seguridad"
                      secondary="Configura backups automáticos para proteger tus datos"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                    <ListItemText 
                      primary="Visibilidad de datos"
                      secondary="Controla qué información se muestra en cada sección"
                    />
                  </ListItem>
                </List>
              </ExpandableSection>
            </Box>
          </Fade>
        );

      case 'tips':
        return (
          <Fade in timeout={600}>
            <Box>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Consejos y Mejores Prácticas
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      borderRadius: 3,
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <Box sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main, mb: 2 }}>
                        <CheckCircleIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Registra a diario
                      </Typography>
                    </Box>
                    <CardContent>
                      <Typography variant="body2">
                        Crea el hábito de registrar tus transacciones diariamente para mantener datos precisos y actualizados.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      borderRadius: 3,
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <Box sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, mb: 2 }}>
                        <SpeedIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Revisa semanalmente
                      </Typography>
                    </Box>
                    <CardContent>
                      <Typography variant="body2">
                        Dedica 10 minutos cada semana para revisar tus finanzas y detectar tendencias a tiempo.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      borderRadius: 3,
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, mb: 2 }}>
                        <BarChartIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Planifica mensualmente
                      </Typography>
                    </Box>
                    <CardContent>
                      <Typography variant="body2">
                        Al inicio de cada mes, establece un presupuesto por categorías basado en tus datos históricos.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <ExpandableSection
                id="financial-optimization"
                title="Optimización Financiera"
                icon={<MonetizationOnIcon />}
                color={theme.palette.success.main}
              >
                <List>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Categoriza con precisión"
                      secondary="Cuanto más precisas sean tus categorías, más útiles serán tus análisis"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Diferencia gastos necesarios y discrecionales"
                      secondary="Usa subcategorías para diferenciar gastos esenciales y opcionales"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Analiza tendencias trimestrales"
                      secondary="Revisa tus finanzas cada trimestre para identificar patrones amplios"
                    />
                  </ListItem>
                </List>
              </ExpandableSection>

              <ExpandableSection
                id="habit-development"
                title="Desarrollo de Hábitos"
                icon={<EmojiEventsIcon />}
                color={theme.palette.info.main}
              >
                <List>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Comienza con pequeños pasos"
                      secondary="Es mejor empezar con versiones simples que puedas cumplir consistentemente"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Vincúlalos a hábitos existentes"
                      secondary="Asocia nuevos hábitos a rutinas que ya realizas"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                    <ListItemText 
                      primary="Celebra pequeñas victorias"
                      secondary="Reconoce y celebra rachas de cumplimiento para reforzar el comportamiento"
                    />
                  </ListItem>
                </List>
              </ExpandableSection>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Centro de Ayuda">
      <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header principal */}
        <Card 
          elevation={4}
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha('#ffffff', 0.2),
                  color: 'white',
                  width: 80,
                  height: 80
                }}
              >
                <MenuBookIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  Centro de Ayuda
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Encuentra toda la información que necesitas para aprovechar al máximo LifeTrack
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Layout de 2 columnas */}
        <Grid container spacing={4}>
          {/* Columna izquierda - Navegación */}
          <Grid item xs={12} md={4} lg={3}>
            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 3, 
                position: 'sticky', 
                top: 20,
                height: 'fit-content'
              }}
            >
              <CardHeader
                title="Categorías"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              />
              <CardContent sx={{ p: 0 }}>
                <List disablePadding>
                  {helpCategories.map((category) => (
                    <ListItem
                      key={category.id}
                      button
                      selected={selectedCategory === category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      sx={{
                        py: 2,
                        px: 3,
                        borderLeft: selectedCategory === category.id 
                          ? `4px solid ${category.color}` 
                          : '4px solid transparent',
                        '&.Mui-selected': {
                          bgcolor: alpha(category.color, 0.1),
                          '&:hover': {
                            bgcolor: alpha(category.color, 0.15)
                          }
                        },
                        '&:hover': {
                          bgcolor: alpha(category.color, 0.05)
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: selectedCategory === category.id 
                              ? category.color 
                              : alpha(category.color, 0.1),
                            color: selectedCategory === category.id 
                              ? 'white' 
                              : category.color,
                            width: 40,
                            height: 40
                          }}
                        >
                          {category.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={category.title}
                        secondary={category.description}
                        primaryTypographyProps={{
                          fontWeight: selectedCategory === category.id ? 'bold' : 'medium'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Columna derecha - Contenido */}
          <Grid item xs={12} md={8} lg={9}>
            <Box sx={{ minHeight: '60vh' }}>
              {renderContent()}
            </Box>
          </Grid>
        </Grid>

        {/* Footer de soporte */}
        <Divider sx={{ my: 6 }} />
        
        <Card 
          elevation={2}
          sx={{ 
            borderRadius: 3,
            textAlign: 'center',
            p: 4,
            bgcolor: alpha(theme.palette.info.main, 0.05)
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.info.main,
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2
            }}
          >
            <SupportAgentIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
            ¿Necesitas más ayuda?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Si no encuentras la respuesta que buscas, nuestro equipo de soporte está aquí para ayudarte
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<SupportAgentIcon />}
            sx={{ 
              borderRadius: 3,
              px: 4,
              py: 1.5
            }}
          >
            Contactar Soporte
          </Button>
        </Card>
      </Container>
    </Layout>
  );
}

export default Ayuda; 