import React from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CommuteIcon from '@mui/icons-material/Commute';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import FlightIcon from '@mui/icons-material/Flight';
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HomeIcon from '@mui/icons-material/Home';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DevicesIcon from '@mui/icons-material/Devices';
import WorkIcon from '@mui/icons-material/Work';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import CannabisIcon from '../icons/CannabisIcon';

// Devuelve un ícono Material UI según el nombre de la categoría.
// Si no hay match exacto, busca coincidencias parciales. Default: <CategoryIcon />.
export const getCategoryIcon = (category) => {
  const categoryMapping = {
    'Supermercado': <ShoppingCartIcon fontSize="small" />,
    'Alimentos': <RestaurantIcon fontSize="small" />,
    'Restaurante': <RestaurantIcon fontSize="small" />,
    'Comida': <FastfoodIcon fontSize="small" />,
    'Transporte': <CommuteIcon fontSize="small" />,
    'Auto': <DirectionsCarIcon fontSize="small" />,
    'Nafta': <LocalGasStationIcon fontSize="small" />,
    'Viajes': <FlightIcon fontSize="small" />,
    'Educación': <SchoolIcon fontSize="small" />,
    'Entretenimiento': <SportsEsportsIcon fontSize="small" />,
    'Entretenimiento, salidas y comida': <RestaurantIcon fontSize="small" />,
    'Hogar': <HomeIcon fontSize="small" />,
    'Hogar y servicios': <HomeIcon fontSize="small" />,
    'Casa': <HomeIcon fontSize="small" />,
    'Servicios': <ElectricalServicesIcon fontSize="small" />,
    'Indoor': <CannabisIcon fontSize="small" />,
    'Indoor y porro': <CannabisIcon fontSize="small" />,
    'Salud': <HealthAndSafetyIcon fontSize="small" />,
    'Lilo': <FavoriteIcon fontSize="small" />,
    'Ropa': <CheckroomIcon fontSize="small" />,
    'Tecnología': <DevicesIcon fontSize="small" />,
    'Trabajo': <WorkIcon fontSize="small" />,
    'Extras': <MoreHorizIcon fontSize="small" />,
    'Ahorro': <SavingsIcon fontSize="small" />,
    'Inversiones': <TrendingUpIcon fontSize="small" />,
  };

  if (categoryMapping[category]) {
    return categoryMapping[category];
  }

  // Match parcial (case-insensitive) si no hay match exacto
  if (category) {
    const categoryLower = category.toLowerCase();
    for (const [key, icon] of Object.entries(categoryMapping)) {
      if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
        return icon;
      }
    }
  }

  return <CategoryIcon fontSize="small" />;
};

// Devuelve un color hex/MUI para la categoría. Necesita `theme` (palette) y `dataType`
// para el caso default (gastos = rojo, ingresos = verde).
export const getCategoryColor = (cat, theme, dataType) => {
  switch (cat) {
    case 'Supermercado': return theme.palette.error.main;
    case 'Transporte': return theme.palette.info.main;
    case 'Auto': return theme.palette.warning.main;
    case 'Indoor': return theme.palette.success.main;
    case 'Indoor y porro': return theme.palette.success.main;
    case 'Porro': return theme.palette.secondary.main;
    case 'Hogar': return theme.palette.primary.main;
    case 'Hogar y servicios': return theme.palette.primary.main;
    case 'Entretenimiento': return '#FF4081';
    case 'Entretenimiento, salidas y comida': return '#FF4081';
    case 'Viajes': return '#00BCD4';
    case 'Educacion': return '#9C27B0';
    case 'Salud': return '#4CAF50';
    case 'Salidas': return '#FF9800';
    case 'Lilo': return '#E91E63';
    case 'Extras': return theme.palette.grey[600];
    default:
      return dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main;
  }
};
