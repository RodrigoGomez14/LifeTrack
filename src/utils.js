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
export const formatAmount = (amount, isUSD = false) => {
  if (amount === null || amount === undefined) return '0';
  
  // Si es un valor menor a 1000, mostrarlo normal
  if (Math.abs(amount) < 1000) {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: isUSD ? 'USD' : 'ARS',
      maximumFractionDigits: 0
    }).format(amount).replace('ARS', '');
  }
  
  // Para valores más grandes, usar notación abreviada
  let absValue = Math.abs(amount);
  let sign = amount < 0 ? '-' : '';
  let symbol = isUSD ? 'USD ' : '$ ';
  
  if (absValue >= 1000000000) {
    // Mil millones o más (B)
    return `${sign}${symbol}${(absValue / 1000000000).toFixed(2)}B`;
  } else if (absValue >= 1000000) {
    // Millones (M)
    return `${sign}${symbol}${(absValue / 1000000).toFixed(2)}M`;
  } else if (absValue >= 1000) {
    // Miles (K)
    return `${sign}${symbol}${(absValue / 1000).toFixed(1)}k`;
  }
};

// Formatea string raw del teclado ("1500,50" → "$ 1.500,50")
export const formatAmountStr = (raw) => {
  if (!raw || raw === '0') return '$ 0';
  const parts = raw.split(',');
  const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts[1] !== undefined ? `$ ${int},${parts[1]}` : `$ ${int}`;
};

// Formatea un número sin símbolo de moneda (el prefijo lo pone el template)
// { abbreviate: true } → abrevia con k/M/B (para ARS)
// { abbreviate: false } → muestra número completo con separador de miles (para USD)
export const formatNumber = (amount, { abbreviate = true } = {}) => {
  if (amount === null || amount === undefined) return '0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '−' : '';
  if (abbreviate && abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abbreviate && abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abbreviate && abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}k`;
  return `${sign}${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(abs)}`;
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
  transactions.forEach(transaction=>{
    if (transaction.category === category) {
      total += transaction.amount;
    }
  })
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
    case 'Mercadopago':
      return '#03A9F4';
    case 'Efectivo':
      return '#43A047';
    case 'Transferencia':
      return '#E91E63';
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

export function getPreviousMonday() {
  const currentDate = new Date();
  const currentDay = currentDate.getDay(); // 0 (Domingo) - 6 (Sábado)
  
  // Calcular el número de días que debemos restar para llegar al lunes
  const daysToMonday = (currentDay + 6) % 7; // Si es domingo, devuelve 6. Si es lunes, devuelve 0
  
  // Obtener el lunes anterior
  const previousMonday = new Date(currentDate);
  previousMonday.setDate(currentDate.getDate() - daysToMonday);

  return previousMonday;
}

// CHECK IF SEARCH CONTAINS WHITE SPACES
export const checkSearch =(search)=>{
  if (!search) return '';
  const raw = search.charAt(0) === '?' ? search.slice(1) : search;
  if (raw.includes('=')) {
    return new URLSearchParams(raw).get('id') || '';
  }
  return checkWhiteSpace(raw);
}

const checkWhiteSpace =(text)=>{
  
  var aux = text
  while(aux.indexOf('%20')!==-1){
      aux = aux.slice(0,aux.indexOf('%20')) + ' ' + aux.slice(aux.indexOf('%20')+3)
  }
  return aux
}


export const getDate = () =>{
  var date=new Date()
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth()+1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`
}

export const convertToDetailedDate = (date) =>{
  const day = date.slice(0,date.indexOf('/'))
  const month = date.slice(date.indexOf('/')+1,-5)
  const year = date.slice(-4)
  const f = new Date(year,month-1,day)
  let meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
  let diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]
  return `${diasSemana[f.getDay()]} ${f.getDate()} de ${meses[f.getMonth()]} de ${f.getFullYear()}`
}


  