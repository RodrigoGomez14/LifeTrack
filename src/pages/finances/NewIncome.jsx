import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Button, 
  TextField, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Chip,
  Stack,
  Tooltip,
  InputAdornment,
  Paper,
  Container
} from '@mui/material';
import { database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; 
import { useStore } from '../../store'; 
import { getDate, formatAmount } from '../../utils';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import WorkIcon from '@mui/icons-material/Work';
import LaptopIcon from '@mui/icons-material/Laptop';
import PeopleIcon from '@mui/icons-material/People';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '@mui/material/styles';

const NewIncome = () => {
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1); // 1: Category, 2: Subcategory, 3: Amount and description

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || !category || !subcategory || !description) {
      return;
    }

    database.ref(`${auth.currentUser.uid}/incomes`).push({
      amount: parseFloat(amount),
      amountUSD: parseFloat(amount/dollarRate['venta']),
      category: category,
      subcategory: subcategory,
      date: getDate(),
      description: description,
      valorUSD: dollarRate['venta']
    });

    // Actualizar el valor de ahorros en ARS y su historial
    database.ref(`${auth.currentUser.uid}/savings/amountARS`).set(userData.savings.amountARS + parseFloat(amount));
    database.ref(`${auth.currentUser.uid}/savings/amountARSHistory`).push({
      date: getDate(),
      amount: parseFloat(amount),
      newTotal: (userData.savings.amountARS + parseFloat(amount)),
    });

    setAmount('');
    setCategory('');
    setSubcategory('');
    setDescription('');
    setStep(1);

    navigate('/finanzas');
  };

  const subcategories = {
    Sueldo: ['Sueldo Base', 'Bonificaciones', 'Comisiones'],
    Freelance: ['Web', 'Diseño', 'Otro Proyecto'],
    Camila: ['Sueldo Base', 'Comisiones', 'Extra'],
    Extras: ['Inversiones', 'Ventas', 'Otros'],
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Sueldo':
        return <WorkIcon />;
      case 'Freelance':
        return <LaptopIcon />;
      case 'Camila':
        return <PeopleIcon />;
      case 'Extras':
        return <MoreHorizIcon />;
      default:
        return <MoreHorizIcon />;
    }
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Sueldo':
        return theme.palette.success.main;
      case 'Freelance':
        return theme.palette.info.main;
      case 'Camila':
        return theme.palette.secondary.main;
      case 'Extras':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setStep(2);
  };

  const handleSubcategorySelect = (subcat) => {
    setSubcategory(subcat);
    setStep(3);
  };

  const handleStepChange = (direction) => {
    if (direction === 'back') {
      if (step === 3) {
        setSubcategory('');
        setStep(2);
      } else if (step === 2) {
        setCategory('');
        setStep(1);
      } else {
        navigate('/finanzas');
      }
    }
  };

  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" fontWeight="medium" gutterBottom align="center">
        Selecciona una categoría
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {Object.keys(subcategories).map((cat) => (
          <Grid item xs={6} sm={4} key={cat}>
            <Card 
              elevation={2} 
              onClick={() => handleCategorySelect(cat)}
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Box
                  sx={{
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    bgcolor: `${getCategoryColor(cat)}15`,
                    mx: 'auto'
                  }}
                >
                  {React.cloneElement(getCategoryIcon(cat), { style: { color: getCategoryColor(cat) } })}
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {cat}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          sx={{ px: 3 }}
        >
          Volver
        </Button>
      </Box>
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Box mb={2} display="flex" alignItems="center">
        <Chip
          icon={getCategoryIcon(category)}
          label={category}
          sx={{ 
            bgcolor: `${getCategoryColor(category)}15`,
            color: getCategoryColor(category),
            fontWeight: 'medium',
            mr: 1
          }}
        />
        <Typography variant="h6" fontWeight="medium">
          Selecciona una subcategoría
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {subcategories[category].map((subcat) => (
          <Grid item xs={6} sm={4} key={subcat}>
            <Paper 
              elevation={2} 
              onClick={() => handleSubcategorySelect(subcat)}
              sx={{ 
                cursor: 'pointer',
                p: 2,
                textAlign: 'center',
                borderLeft: `4px solid ${getCategoryColor(category)}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <Typography variant="body1" fontWeight="medium">
                {subcat}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          sx={{ px: 3 }}
        >
          Volver
        </Button>
      </Box>
    </Box>
  );

  const renderStep3 = () => (
    <Box>
      <Box mb={3}>
        <Stack direction="row" spacing={1} mb={1}>
          <Chip
            icon={getCategoryIcon(category)}
            label={category}
            sx={{ 
              bgcolor: `${getCategoryColor(category)}15`,
              color: getCategoryColor(category),
              fontWeight: 'medium'
            }}
          />
          <Chip
            label={subcategory}
            variant="outlined"
            sx={{ 
              color: theme.palette.text.primary,
              borderColor: getCategoryColor(category),
              fontWeight: 'medium'
            }}
          />
        </Stack>
        
        <Typography variant="h6" fontWeight="medium">
          Detalles del ingreso
        </Typography>
      </Box>
      
      <form onSubmit={handleFormSubmit}>
        <TextField
          label="Monto"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          fullWidth
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">$</InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        
        {amount && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: `1px dashed ${theme.palette.divider}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Equivalente en USD:</Typography>
              <Typography variant="body1" fontWeight="medium">
                USD {formatAmount(parseFloat(amount) / dollarRate['venta'])}
              </Typography>
            </Stack>
          </Box>
        )}
        
        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          fullWidth
          margin="normal"
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => handleStepChange('back')}
            sx={{ px: 3 }}
          >
            Volver
          </Button>
          <Button 
            variant="contained" 
            color="success"
            type="submit" 
            disabled={!amount || !description}
            startIcon={<AddCircleOutlineIcon />}
            sx={{ px: 3 }}
          >
            Registrar Ingreso
          </Button>
        </Box>
      </form>
    </Box>
  );

  return (
    <Layout title="Nuevo Ingreso">
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card elevation={4}>
          <Box sx={{ px: 1, py: 1.5, bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ px: 2, display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                  color: theme.palette.common.white,
                  mr: 2
                }}
              >
                {step}
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {step === 1 ? 'Seleccionar Categoría' : step === 2 ? 'Seleccionar Subcategoría' : 'Completar Detalles'}
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                {step === 3 && (
                  <Tooltip title="Listo para enviar">
                    <CheckCircleIcon color="success" />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
          <CardContent sx={{ p: 3 }}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default NewIncome;
