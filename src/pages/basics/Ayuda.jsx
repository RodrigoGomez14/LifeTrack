import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Collapse, IconButton, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SavingsIcon from '@mui/icons-material/Savings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NatureIcon from '@mui/icons-material/Nature';
import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';
import BackupIcon from '@mui/icons-material/Backup';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import Layout from '../../components/layout/Layout';
import { AnimatedGroup, AnimatedItem } from '../../design-system';

const SECTIONS = [
  {
    id: 'finanzas',
    title: 'Finanzas',
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />,
    color: '#2e7d32',
    items: [
      { label: 'Home', desc: 'Dashboard con balance del mes, ingresos, gastos y ahorros de un vistazo.' },
      { label: 'Nuevo movimiento', desc: 'Wizard de 5 pasos para registrar un gasto o ingreso: monto → categoría → detalle → revisar → confirmado. Accesible desde Home con el botón "+".' },
      { label: 'Gastos e Ingresos', desc: 'Lista mensual con buscador, agrupado por fecha y expansión al tocar. Gráficos de evolución (6 meses) y top categorías del mes. Toggle para alternar entre gastos e ingresos.' },
      { label: 'Tarjetas de crédito', desc: 'Lista de tarjetas con total del período y badge de estado. Vista detalle con movimientos del ciclo de facturación. Vista de cuotas activas con gráfico de compromiso futuro. Registro de pagos con selector de fuente y monto. Subida de resúmenes en PDF.' },
      { label: 'Exchange', desc: 'Registro de compra y venta de dólares. Actualiza automáticamente los saldos en ARS y USD con la cotización del día.' },
      { label: 'Ahorros', desc: 'Fondos múltiples en ARS y USD con historial de movimientos. Transferencias entre fondos con actualización atómica de saldos.' },
      { label: 'Notificaciones', desc: 'Recordatorio diario a las 21:00: "¿Anotaste todos los gastos de hoy?". Se activa desde Configuración → Notificaciones en el dispositivo que quieras.' },
    ],
  },
  {
    id: 'habitos',
    title: 'Hábitos',
    icon: <EmojiEventsIcon sx={{ fontSize: 22 }} />,
    color: '#1565c0',
    items: [
      { label: 'Lista de hábitos', desc: 'Vista de todos tus hábitos con nombre, frecuencia y racha actual. Acceso al detalle de cada uno.' },
      { label: 'Nuevo hábito', desc: 'Formulario para crear un hábito con nombre, descripción, frecuencia y color personalizado.' },
      { label: 'Calendario semanal', desc: 'Vista de calendario con navegación entre semanas. Cada día muestra los hábitos programados y permite marcarlos como completados con un tap.' },
      { label: 'Estadísticas', desc: 'Cuatro tarjetas con métricas: progreso semanal ponderado, mejor rendimiento, mejor día de la semana y hábito que necesita mejorar.' },
      { label: 'Gráfico de evolución', desc: 'Chart de las últimas 5 semanas mostrando porcentaje de cumplimiento para cada hábito activo.' },
    ],
  },
  {
    id: 'plantas',
    title: 'Plantas',
    icon: <NatureIcon sx={{ fontSize: 22 }} />,
    color: '#2e7d32',
    items: [
      { label: 'Jardín', desc: 'Lista de plantas activas agrupadas por etapa (Germinacion, Vegetativo, Floracion, Lavado de Raices, Secado, Curado). Buscador y pestaña Archivo para plantas finalizadas. Botón "+" para nueva planta.' },
      { label: 'Perfil de planta', desc: 'Vista detallada con selector de semana, indicadores de dias por etapa (Vegetativo, Floracion, Secado, Curado), fechas de transplante e inicio de flora. Cuatro botones de accion: Foto, Accion (menu con riego/insecticida/poda/transplante), Log y Siguiente Etapa.' },
      { label: 'Registro de log', desc: 'Wizard de 5 pasos para registrar mediciones diarias: pH → EC → PPM → Temperatura → Revisar. Las mediciones del día se muestran como cuatro tarjetas (pH, EC, PPM, Temp) con colores por tipo y valor tachado si hay pH regulado.' },
      { label: 'Acciones', desc: 'Cada tipo de accion tiene su propio wizard independiente: Riego (plantas / mediciones / agua+aditivos / notas / revisar), Insecticida (plantas / tipo+metodo / producto+dosis / notas / revisar), Poda (plantas / tipo / notas / revisar), Transplante (plantas / maceta+volumen / notas / revisar).' },
      { label: 'Cambio de etapa', desc: 'Wizard de 3 pasos: información de la etapa actual y siguiente con cronología visual → nota opcional → confirmar. La planta avanza por su ciclo de vida: Germinacion → Vegetativo → Floracion → Lavado de Raices → Secado → Curado. Al llegar a Curado se puede archivar.' },
      { label: 'Fotos', desc: 'Subida de fotos desde el perfil. Galería con vista en grilla y comparación lado a lado entre fotos de distintas fechas. Las fotos del día se muestran en miniatura debajo del log.' },
      { label: 'Gráfico de evolución', desc: 'Chart de líneas con series de pH, EC y PPM a lo largo del tiempo para detectar tendencias.' },
      { label: 'Nutrientes & Insecticidas', desc: 'Biblioteca de productos con dos pestanas: Nutrientes e Insecticidas. Los nutrientes muestran dosis organizadas por etapa (Vegetativo/Floracion) y semana. Wizards dedicados para crear nuevos: /CrearNutriente, /crearInsecticida.' },
    ],
  },
  {
    id: 'configuracion',
    title: 'Configuración',
    icon: <SettingsIcon sx={{ fontSize: 22 }} />,
    color: '#546e7a',
    items: [
      { label: 'Perfil', desc: 'Foto de avatar (tocá la cámara para cambiarla) y nombre de display con botón Guardar. Se actualiza en AppBar, Drawer y Perfil.' },
      { label: 'Notificaciones', desc: 'Botón "Activar en este dispositivo" para registrar el dispositivo actual como receptor del recordatorio diario de gastos. Solo un dispositivo recibe notificaciones a la vez. Chip verde confirma que está activado, botón rojo para desactivar.' },
      { label: 'Datos y backup', desc: 'Auto-backup con toggle y selector de frecuencia (diario, semanal, mensual). Botón "Exportar backup ahora" para descarga manual de todos tus datos en JSON. Zona peligrosa con confirmación por email para eliminar la cuenta permanentemente.' },
    ],
  },
  {
    id: 'consejos',
    title: 'Consejos',
    icon: <LightbulbIcon sx={{ fontSize: 22 }} />,
    color: '#f57c00',
    items: [
      { label: 'Registrá tus gastos a diario', desc: 'El recordatorio de las 21:00 existe por algo. Si anotás todo en el momento, evitás olvidos y mantenés tus finanzas al día sin esfuerzo.' },
      { label: 'Usá las etapas de tus plantas', desc: 'Registrar el cambio de etapa (Germinación → Vegetativo → Floración → Secado → Curado) te da visibilidad real de cuánto lleva cada planta en cada fase. Los indicadores de días por etapa en el perfil son la mejor forma de seguir el ciclo.' },
      { label: 'Subí fotos seguido', desc: 'Sacar una foto por semana te permite comparar visualmente el progreso de tus plantas. La galería tiene vista de comparación lado a lado entre fechas.' },
      { label: 'Medí pH y EC siempre que riegues', desc: 'El gráfico de evolución de mediciones se construye solo con los datos que registres. Cuantos más puntos, mejor vas a entender las tendencias de tu solución.' },
      { label: 'Activá el backup automático', desc: 'Un backup diario de tus datos en formato JSON te protege contra cualquier imprevisto. En Configuración → Datos poné el toggle en ON y frecuencia diaria.' },
      { label: 'Crea tus nutrientes en la biblioteca', desc: 'Antes de registrar un riego, asegurate de tener los productos cargados en Nutrientes & Insecticidas con sus dosis. Despues aparecen como chips para seleccionar rapido en el wizard de Riego.' },
    ],
  },
];

const Ayuda = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <Layout title="Ayuda">
      <AnimatedGroup sx={{ maxWidth: 600, mx: 'auto', p: 2, pb: 8, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {SECTIONS.map((section) => {
          const isOpen = expanded === section.id;
          return (
            <AnimatedItem key={section.id}><Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box
                onClick={() => toggle(section.id)}
                sx={{
                  p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                  bgcolor: isOpen ? alpha(section.color, 0.06) : 'transparent',
                  '&:hover': { bgcolor: alpha(section.color, 0.04) },
                }}
              >
                <Box sx={{ color: section.color }}>{section.icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, color: section.color }}>
                  {section.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                  {section.items.length} temas
                </Typography>
                <IconButton size="small" sx={{ color: 'text.secondary', transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              </Box>
              <Collapse in={isOpen}>
                <CardContent sx={{ pt: 0, pb: 2, px: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  {section.items.map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        py: 1.5, display: 'flex', gap: 1.5,
                        borderBottom: i < section.items.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                      }}
                    >
                      <Box
                        sx={{
                          mt: 0.3, width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                          bgcolor: section.color,
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Collapse>
            </Card></AnimatedItem>
          );
        })}
      </AnimatedGroup>
    </Layout>
  );
};

export default Ayuda;
