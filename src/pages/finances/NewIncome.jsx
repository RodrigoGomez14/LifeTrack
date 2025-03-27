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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { alpha } from '@mui/material/styles';

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        ¿De dónde proviene tu ingreso?
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Selecciona la categoría que mejor describe tu ingreso
      </Typography>

      <Grid container spacing={2} sx={{ mt: 2, flex: 1, width: '100%' }}>
        {Object.keys(subcategories).map((cat) => (
          <Grid item xs={12} sm={6} md={4} key={cat} sx={{ width: '100%' }}>
            <Card 
              elevation={2} 
              onClick={() => handleCategorySelect(cat)}
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                width: '100%',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  '& .category-bg': {
                    opacity: 0.15
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: getCategoryColor(cat)
                }
              }}
            >
              <Box 
                className="category-bg"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: getCategoryColor(cat),
                  opacity: 0.1,
                  transition: 'opacity 0.3s ease'
                }}
              />
              <CardContent sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                p: 3
              }}>
                <Box
                  sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: `${getCategoryColor(cat)}15`,
                    color: getCategoryColor(cat)
                  }}
                >
                  {React.cloneElement(getCategoryIcon(cat), { sx: { fontSize: 30 } })}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {cat}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subcategories[cat].join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Volver
        </Button>
      </Box>
    </Box>
  );

  const renderStep2 = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Selecciona una subcategoría
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={getCategoryIcon(category)}
            label={category}
            sx={{ 
              bgcolor: `${getCategoryColor(category)}15`,
              color: getCategoryColor(category),
              fontWeight: 'medium',
              height: 32
            }}
          />
          <Typography variant="body1" color="text.secondary">
            Especifica el tipo de {category.toLowerCase()}
          </Typography>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ flex: 1, width: '100%' }}>
        {subcategories[category].map((subcat) => (
          <Grid item xs={12} sm={6} key={subcat} sx={{ width: '100%' }}>
            <Card 
              elevation={2} 
              onClick={() => handleSubcategorySelect(subcat)}
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                width: '100%',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  '& .subcategory-bg': {
                    opacity: 0.15
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 4,
                  bottom: 0,
                  bgcolor: getCategoryColor(category)
                }
              }}
            >
              <Box 
                className="subcategory-bg"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: getCategoryColor(category),
                  opacity: 0.1,
                  transition: 'opacity 0.3s ease'
                }}
              />
              <CardContent sx={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
                p: 3
              }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: `${getCategoryColor(category)}15`,
                    color: getCategoryColor(category),
                    mr: 2
                  }}
                >
                  {React.cloneElement(getCategoryIcon(category), { sx: { fontSize: 24 } })}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {subcat}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subcategoría de {category}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Volver
        </Button>
      </Box>
    </Box>
  );

  const renderStep3 = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Detalles del ingreso
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={getCategoryIcon(category)}
            label={category}
            sx={{ 
              bgcolor: `${getCategoryColor(category)}15`,
              color: getCategoryColor(category),
              fontWeight: 'medium',
              height: 32
            }}
          />
          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          <Chip
            label={subcategory}
            sx={{ 
              bgcolor: alpha(getCategoryColor(category), 0.1),
              color: getCategoryColor(category),
              fontWeight: 'medium',
              height: 32
            }}
          />
        </Stack>
      </Box>

      <Card 
        elevation={2}
        sx={{ 
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
          flex: 1,
          width: '100%'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: getCategoryColor(category)
          }}
        />
        
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ¿Cuánto ingresaste?
            </Typography>
          <TextField
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="h6" color="primary" fontWeight="bold">$</Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderWidth: 2,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  }
                }
              }}
            />
          </Box>
          
          {amount && (
            <Card 
              elevation={0}
              sx={{ 
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px dashed ${theme.palette.primary.main}`,
                borderRadius: 2
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Equivalente en USD:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  USD {formatAmount(parseFloat(amount) / dollarRate['venta'])}
                </Typography>
              </Stack>
            </Card>
          )}
          
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Describe tu ingreso
            </Typography>
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Ej: Sueldo mensual de trabajo"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderWidth: 2,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  }
                }
              }}
            />
          </Box>
        </Stack>
      </Card>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Volver
        </Button>
        <Button 
          variant="contained" 
          color="success"
          type="submit"
          onClick={handleFormSubmit}
          disabled={!amount || !description}
          endIcon={<CheckCircleIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Registrar Ingreso
        </Button>
      </Box>
    </Box>
  );

  return (
    <Layout title="Nuevo Ingreso">
      <Box 
        sx={{ 
          minHeight: '100vh',
          pt: 8, // Espacio para el AppBar
          pb: 4,
          px: 2,
          width: '100%'
        }}
      >
        <Container maxWidth={false} sx={{ width: '100%' }}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            height: 'calc(100vh - 100px)', // Alto total menos el padding
            alignItems: 'stretch',
            width: '100%'
          }}>
            {/* Panel de progreso */}
            <Card 
              elevation={4} 
              sx={{ 
                width: { xs: '100%', md: 280 },
                bgcolor: 'background.paper',
                borderRadius: 3,
                flexShrink: 0
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Nuevo Ingreso
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Completa los siguientes pasos para registrar tu ingreso
                </Typography>
                
                <Stack spacing={2} mt={4}>
                  {[
                    { label: 'Categoría', icon: getCategoryIcon(category || 'default') },
                    { label: 'Subcategoría', icon: getCategoryIcon(category || 'default') },
                    { label: 'Detalles', icon: <AddCircleOutlineIcon /> }
                  ].map((item, index) => (
                    <Box 
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: step === index + 1 ? 'primary.main' : 'transparent',
                        color: step === index + 1 ? 'white' : 'text.primary',
                        border: `1px solid ${step === index + 1 ? 'transparent' : theme.palette.divider}`,
                        opacity: step >= index + 1 ? 1 : 0.5
                      }}
                    >
                      {React.cloneElement(item.icon, { 
                        style: { 
                          color: step === index + 1 ? 'white' : theme.palette.text.secondary 
                        }
                      })}
                      <Typography variant="body1" fontWeight={step === index + 1 ? 'bold' : 'regular'}>
                        {item.label}
                      </Typography>
                      {step > index + 1 && (
                        <CheckCircleIcon sx={{ ml: 'auto', color: theme.palette.success.main }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>

            {/* Panel principal */}
            <Card 
              elevation={4} 
              sx={{ 
                flex: 1,
                bgcolor: 'background.paper',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}
            >
              <Box sx={{ 
                p: 3,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default NewIncome;
