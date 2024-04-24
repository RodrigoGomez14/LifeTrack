import WifiIcon from '@mui/icons-material/Wifi';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HelpIcon from '@mui/icons-material/Help';
import DriveEtaIcon from '@mui/icons-material/DriveEta';

// Función para formatear un monto de dinero
export const formatAmount = (amount) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };
  
  // Función para obtener el nombre del mes a partir de su número (1 para enero, 2 para febrero, etc.)
  export const getMonthName = (monthNumber) => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[monthNumber - 1] || '';
  };
  
  // Función para convertir minutos en horas y minutos
  export const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  export const sumTransactionsByCategory = (transactions, category) => {
    let total = 0;
    for (const transaction of Object.values(transactions)) {
      if (transaction.category === category) {
        total += transaction.amount;
      }
    }
    return total;
  };

  export const getCategoryIcon = (category) => {
    switch (category) {
      case 'Auto':
        return <DriveEtaIcon />;
      case 'Servicios':
        return <WifiIcon />;
      case 'Indoor':
        return <HomeIcon />;
      case 'Supermercado':
        return <ShoppingBasketIcon />;
      case 'Transporte':
        return <DirectionsBusIcon />;
      case 'Extras':
        return <AddCircleIcon />;
      case 'Uber':
        return <LocalTaxiIcon />;
      case 'Sueldo':
        return <WorkIcon />;
      case 'Freelance':
        return <AttachMoneyIcon />;
      case 'Camila':
        return <PersonIcon />;
      default:
        return <HelpIcon />;
    }
  };
  