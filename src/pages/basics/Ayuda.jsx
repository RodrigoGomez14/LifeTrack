import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Button,
  Stack,
  alpha,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Iconos
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import NatureIcon from '@mui/icons-material/Nature';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';

function Ayuda() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Componente para secciones de ayuda
  const HelpSection = ({ title, icon, children }) => (
    <Accordion 
      sx={{
        mt: 2,
        borderRadius: '8px',
        '&:before': { display: 'none' },
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          }
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box 
            sx={{ 
              display: 'flex', 
              p: 1,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6">{title}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );

  // Componente para consejos destacados
  const TipCard = ({ title, description, icon, color = 'primary' }) => (
    <Card 
      elevation={0} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        bgcolor: alpha(theme.palette[color].main, 0.05),
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.1)}`
        }
      }}
    >
      <Box p={3}>
        <Box 
          sx={{ 
            display: 'inline-flex',
            p: 1.5,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: theme.palette[color].main,
            mb: 2
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Card>
  );

  const renderIntroContent = () => (
    <>
      <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
        Bienvenido a LifeTrack: Tu asistente personal para finanzas y más
      </Typography>
      
      <Alert 
        severity="info" 
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          '& .MuiAlert-icon': {
            fontSize: 28
          }
        }}
      >
        <Typography variant="body1">
          LifeTrack te ayuda a gestionar tus finanzas personales, controlar tus hábitos y hacer seguimiento de tus actividades diarias en un solo lugar.
        </Typography>
      </Alert>

      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
        Características principales:
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TipCard 
            title="Gestión financiera completa" 
            description="Controla gastos, ingresos, ahorros y tarjetas de crédito en un solo lugar."
            icon={<MonetizationOnIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TipCard 
            title="Seguimiento de hábitos" 
            description="Establece y monitorea hábitos diarios para mejorar tu calidad de vida."
            icon={<EmojiEventsIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TipCard 
            title="Personalización completa" 
            description="Adapta la aplicación a tus necesidades con temas personalizados y configuraciones avanzadas."
            icon={<PaletteIcon />}
            color="secondary"
          />
        </Grid>
      </Grid>

      <Typography variant="body1" paragraph>
        Para comenzar, explora las diferentes secciones de ayuda o navega directamente a las funciones que necesites desde el menú principal.
      </Typography>

      <Box 
        sx={{ 
          borderRadius: 2, 
          p: 3, 
          mt: 2,
          bgcolor: alpha(theme.palette.warning.main, 0.05),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <LightbulbIcon color="warning" />
          <Typography variant="h6" color="warning.dark">Consejo rápido</Typography>
        </Stack>
        <Typography variant="body2">
          ¿Primera vez en LifeTrack? Te recomendamos comenzar configurando tus categorías de gastos e ingresos en la sección de Finanzas para obtener informes más precisos desde el principio.
        </Typography>
      </Box>
    </>
  );

  const renderFinancesContent = () => (
    <>
      <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
        Gestión de finanzas
      </Typography>

      <HelpSection 
        title="Panel de finanzas" 
        icon={<BarChartIcon />}
      >
        <Typography variant="body1" paragraph>
          El panel de finanzas es tu centro de control financiero. Aquí puedes:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Ver resumen de gastos e ingresos" 
              secondary="El panel muestra una visión general de tus finanzas del mes actual, con gráficos y totales."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Explorar por categorías" 
              secondary="Analiza tus gastos e ingresos agrupados por categorías para entender mejor tus hábitos financieros."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Filtrar por período" 
              secondary="Usa el navegador de tiempo para ver datos de meses anteriores o seleccionar rangos específicos."
            />
          </ListItem>
        </List>
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom sx={{ mt: 2 }}>
          Consejo profesional:
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Revisa mensualmente la distribución de gastos por categoría para identificar áreas donde puedes reducir gastos y aumentar tus ahorros.
        </Typography>
      </HelpSection>

      <HelpSection 
        title="Registro de gastos e ingresos" 
        icon={<MonetizationOnIcon />}
      >
        <Typography variant="body1" paragraph>
          Registrar tus transacciones es sencillo y rápido:
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <TrendingDownIcon color="error" />
                  <Typography variant="h6">Registrar gasto</Typography>
                </Stack>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Pulsa el botón '+' y selecciona 'Nuevo Gasto'"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. Ingresa monto, fecha y descripción"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Selecciona categoría y subcategoría"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="4. Elige método de pago (efectivo o tarjeta)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="5. Guarda para actualizar automáticamente tus reportes"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.05), height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="h6">Registrar ingreso</Typography>
                </Stack>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Pulsa el botón '+' y selecciona 'Nuevo Ingreso'"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. Ingresa monto, fecha y descripción"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Selecciona fuente de ingreso"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="4. Indica si deseas agregar el monto a tus ahorros"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="5. Guarda para actualizar automáticamente tus reportes"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
          Recomendaciones:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
            <ListItemText 
              primary="Registra las transacciones en el momento" 
              secondary="Crea el hábito de registrar tus gastos inmediatamente para no olvidarlos."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
            <ListItemText 
              primary="Usa categorías específicas" 
              secondary="Cuanto más específicas sean tus categorías, más útiles serán tus análisis."
            />
          </ListItem>
        </List>
      </HelpSection>

      <HelpSection 
        title="Gestión de tarjetas de crédito" 
        icon={<CreditCardIcon />}
      >
        <Typography variant="body1" paragraph>
          La sección de tarjetas de crédito te permite gestionar todas tus tarjetas en un solo lugar:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Registrar tarjetas" 
              secondary="Agrega todas tus tarjetas con su información básica como nombre, límite y fechas de cierre."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Control de gastos por tarjeta" 
              secondary="Visualiza todos los gastos asociados a cada tarjeta, agrupados por período de facturación."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Gestión de fechas importantes" 
              secondary="Actualiza las fechas de cierre y vencimiento mensualmente para mantener un control preciso."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Subida de resúmenes" 
              secondary="Sube los resúmenes de tus tarjetas en formato PDF para tener toda la información en un solo lugar."
            />
          </ListItem>
        </List>
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom sx={{ mt: 2 }}>
          Consejo profesional:
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Utiliza el botón "Pagar Todas las Tarjetas" cuando llegue el vencimiento para registrar automáticamente los pagos como gastos y mantener tus saldos actualizados.
        </Typography>
      </HelpSection>

      <HelpSection 
        title="Evolución de ahorros" 
        icon={<AccountBalanceWalletIcon />}
      >
        <Typography variant="body1" paragraph>
          El seguimiento de ahorros te permite visualizar cómo evolucionan tus finanzas a lo largo del tiempo:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Gráfico de evolución histórica" 
              secondary="Visualiza cómo tus ahorros han cambiado a lo largo del tiempo, con un balance diario que incluye ingresos y gastos."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Metas de ahorro" 
              secondary="Establece metas y observa tu progreso en el gráfico para mantenerte motivado."
            />
          </ListItem>
        </List>
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom sx={{ mt: 2 }}>
          Consejo profesional:
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Revisa la gráfica de evolución mensualmente para identificar tendencias y ajustar tus hábitos de gasto e ingreso según sea necesario.
        </Typography>
      </HelpSection>
    </>
  );

  const renderHabitsContent = () => (
    <>
      <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
        Seguimiento de hábitos
      </Typography>

      <HelpSection 
        title="Crear y gestionar hábitos" 
        icon={<FormatListBulletedIcon />}
      >
        <Typography variant="body1" paragraph>
          La sección de hábitos te permite crear y dar seguimiento a hábitos diarios, semanales o mensuales:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Crear nuevos hábitos" 
              secondary="Define hábitos con nombre, descripción, frecuencia y tipo de seguimiento."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Registrar cumplimiento" 
              secondary="Marca los hábitos como completados cada día para mantener un registro de tu constancia."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Visualizar estadísticas" 
              secondary="Revisa tu desempeño con gráficos de frecuencia y rachas de cumplimiento."
            />
          </ListItem>
        </List>
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom sx={{ mt: 2 }}>
          Consejo profesional:
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Comienza con 2-3 hábitos simples y ve aumentando gradualmente. Es mejor tener consistencia en pocos hábitos que intentar cambiar todo a la vez.
        </Typography>
      </HelpSection>
    </>
  );

  const renderPlantsContent = () => (
    <>
      <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
        Cuidado de plantas
      </Typography>

      <HelpSection 
        title="Gestión de plantas" 
        icon={<NatureIcon />}
      >
        <Typography variant="body1" paragraph>
          La sección de plantas te permite llevar un registro detallado de tus plantas y sus cuidados:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Registrar plantas" 
              secondary="Agrega tus plantas con nombre, especie, fecha de adquisición y ubicación."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Calendarios de riego" 
              secondary="Establece recordatorios de riego basados en las necesidades específicas de cada planta."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Registro de cuidados" 
              secondary="Documenta riegos, fertilizaciones, trasplantes y otros cuidados para cada planta."
            />
          </ListItem>
        </List>
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom sx={{ mt: 2 }}>
          Consejo profesional:
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Toma fotos de tus plantas regularmente y agrégalas a su perfil para monitorear visualmente su crecimiento y salud a lo largo del tiempo.
        </Typography>
      </HelpSection>
    </>
  );

  const renderSettingsContent = () => (
    <>
      <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
        Configuración y personalización
      </Typography>

      <HelpSection 
        title="Personalización del tema" 
        icon={<PaletteIcon />}
      >
        <Typography variant="body1" paragraph>
          Personaliza la apariencia de LifeTrack para adaptarla a tus preferencias:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Temas predefinidos" 
              secondary="Selecciona entre varios temas predefinidos con combinaciones armoniosas de colores."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Modo oscuro/claro" 
              secondary="Activa el modo oscuro para reducir la fatiga visual en ambientes con poca luz."
            />
          </ListItem>
        </List>
      </HelpSection>

      <HelpSection 
        title="Configuración de privacidad" 
        icon={<FingerprintIcon />}
      >
        <Typography variant="body1" paragraph>
          Gestiona la privacidad y seguridad de tus datos:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Copias de seguridad" 
              secondary="Configura backups automáticos o crea copias de seguridad manuales para proteger tus datos."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText 
              primary="Visibilidad de datos" 
              secondary="Controla qué información se muestra en cada sección de la aplicación."
            />
          </ListItem>
        </List>
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom sx={{ mt: 2 }}>
          Consejo profesional:
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Programa copias de seguridad automáticas semanales para asegurar que nunca pierdas tus datos importantes.
        </Typography>
      </HelpSection>
    </>
  );

  const renderTipsContent = () => (
    <>
      <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
        Consejos y mejores prácticas
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TipCard 
            title="Registra a diario" 
            description="Crea el hábito de registrar tus transacciones diariamente para mantener datos precisos y actualizados."
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TipCard 
            title="Revisa semanalmente" 
            description="Dedica 10 minutos cada semana para revisar tus finanzas y detectar cualquier tendencia negativa a tiempo."
            icon={<SearchIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TipCard 
            title="Planifica mensualmente" 
            description="Al inicio de cada mes, establece un presupuesto por categorías basado en tus datos históricos."
            icon={<BarChartIcon />}
            color="primary"
          />
        </Grid>
      </Grid>

      <HelpSection 
        title="Optimización financiera" 
        icon={<MonetizationOnIcon />}
      >
        <Typography variant="body1" paragraph>
          Aprovecha al máximo las funciones financieras de LifeTrack:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
            <ListItemText 
              primary="Categoriza con precisión" 
              secondary="Cuanto más precisas sean tus categorías, más útiles serán tus análisis y presupuestos."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
            <ListItemText 
              primary="Diferencia gastos necesarios y discrecionales" 
              secondary="Usa subcategorías para diferenciar entre gastos esenciales y opcionales dentro de una misma categoría."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
            <ListItemText 
              primary="Analiza tendencias trimestrales" 
              secondary="Además del análisis mensual, revisa tus finanzas cada trimestre para identificar patrones más amplios."
            />
          </ListItem>
        </List>
      </HelpSection>

      <HelpSection 
        title="Desarrollo de hábitos" 
        icon={<EmojiEventsIcon />}
      >
        <Typography variant="body1" paragraph>
          Maximiza tu éxito en la creación de nuevos hábitos:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
            <ListItemText 
              primary="Comienza con pequeños pasos" 
              secondary="Es mejor empezar con versiones simples de hábitos que puedas cumplir consistentemente."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
            <ListItemText 
              primary="Vincúlalos a hábitos existentes" 
              secondary="Asocia nuevos hábitos a rutinas que ya realizas para aumentar la probabilidad de éxito."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
            <ListItemText 
              primary="Celebra pequeñas victorias" 
              secondary="Reconoce y celebra cuando mantengas rachas de cumplimiento para reforzar el comportamiento."
            />
          </ListItem>
        </List>
      </HelpSection>
    </>
  );

  const tabContent = [
    { label: 'Introducción', icon: <HelpOutlineIcon />, content: renderIntroContent() },
    { label: 'Finanzas', icon: <AccountBalanceWalletIcon />, content: renderFinancesContent() },
    { label: 'Hábitos', icon: <FormatListBulletedIcon />, content: renderHabitsContent() },
    { label: 'Plantas', icon: <NatureIcon />, content: renderPlantsContent() },
    { label: 'Configuración', icon: <SettingsIcon />, content: renderSettingsContent() },
    { label: 'Consejos', icon: <LightbulbIcon />, content: renderTipsContent() },
  ];

  return (
    <Layout title="Ayuda">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2, 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box 
            sx={{ 
              p: 2,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60
            }}
          >
            <HelpOutlineIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="medium">
              Centro de ayuda de LifeTrack
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Encuentra toda la información que necesitas para aprovechar al máximo LifeTrack. 
              Selecciona una categoría para comenzar o utiliza la navegación por pestañas.
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{ 
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTab-root': {
                minHeight: 64,
                py: 2
              }
            }}
          >
            {tabContent.map((tab, index) => (
              <Tab 
                key={index}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {tab.icon}
                    <Box component="span">{tab.label}</Box>
                  </Stack>
                } 
                sx={{
                  fontWeight: 'medium',
                  textTransform: 'none',
                  borderRadius: '8px 8px 0 0',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 'bold'
                  }
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ py: 2 }}>
          {tabContent[activeTab].content}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            ¿No encuentras la respuesta que buscas?
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ImportantDevicesIcon />}
            sx={{ mt: 1, textTransform: 'none' }}
          >
            Contactar soporte técnico
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}

export default Ayuda; 