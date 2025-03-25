import React from 'react';
import { CircularProgress, Grid, Typography, Box, keyframes, Container, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SavingsIcon from '@mui/icons-material/Savings';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Animación para el pulso del texto
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
`;

// Animación para los íconos flotantes
const float = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;

// Animación para el brillo
const shine = keyframes`
  0% {
    background-position: -100px;
  }
  40%, 100% {
    background-position: 300px;
  }
`;

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  backgroundClip: 'text',
  textFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${pulse} 2s infinite ease-in-out`,
  marginBottom: theme.spacing(3),
  fontSize: '3.5rem',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
    backgroundSize: '200px 100%',
    backgroundRepeat: 'no-repeat',
    animation: `${shine} 3s infinite`,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2.5rem',
  },
}));

const StyledCaption = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontWeight: 500,
  fontSize: '1.2rem',
  marginBottom: theme.spacing(2),
  letterSpacing: '0.1rem',
}));

const ProgressWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const GradientOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}30 0%, ${theme.palette.secondary.main}50 100%)`,
  opacity: 0.3,
  zIndex: -1,
  borderRadius: '50%',
  width: '140px',
  height: '140px',
  margin: 'auto',
}));

const FloatingIcon = styled(IconButton)(({ theme, delay = 0, size = 'medium', position = {} }) => ({
  position: 'absolute',
  color: theme.palette.primary.main,
  animation: `${float} 4s infinite ease-in-out`,
  animationDelay: `${delay}s`,
  opacity: 0.7,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(5px)',
  padding: theme.spacing(1),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  ...position,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: 'scale(1.1)',
    opacity: 1,
  },
}));

const Background = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}aa 0%, ${theme.palette.secondary.dark}aa 100%)`,
  zIndex: -1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 8%, transparent 8%)',
    backgroundPosition: '0 0',
    backgroundSize: '20px 20px',
    transform: 'translate(-50%, -50%) rotate(30deg)',
  },
}));

const Card = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(5),
  borderRadius: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(12px)',
  maxWidth: '90%',
  width: '500px',
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid rgba(255, 255, 255, 0.5)`,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const RotatingBackgroundCircle = styled(Box)(({ theme, size, top, left, opacity = 0.1 }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  opacity: opacity,
  top: top,
  left: left,
  zIndex: -1,
  filter: 'blur(40px)',
}));

const Loading = ({ open }) => {
  return (
    <Container 
      maxWidth={false}
      disableGutters
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Background />
      
      {/* Círculos de fondo */}
      <RotatingBackgroundCircle size="400px" top="-100px" left="-100px" opacity={0.06} />
      <RotatingBackgroundCircle size="300px" top="50%" left="70%" opacity={0.07} />
      <RotatingBackgroundCircle size="200px" top="80%" left="20%" opacity={0.05} />
      
      {/* Íconos flotantes */}
      <FloatingIcon delay={0} position={{ top: '15%', left: '20%' }}>
        <MonetizationOnIcon fontSize="large" />
      </FloatingIcon>
      
      <FloatingIcon delay={1.2} position={{ top: '25%', right: '15%' }}>
        <DirectionsCarIcon fontSize="large" />
      </FloatingIcon>
      
      <FloatingIcon delay={0.8} position={{ bottom: '20%', left: '25%' }}>
        <LocalFloristIcon fontSize="large" />
      </FloatingIcon>
      
      <FloatingIcon delay={2.2} position={{ bottom: '30%', right: '20%' }}>
        <SavingsIcon fontSize="large" />
      </FloatingIcon>
      
      <FloatingIcon delay={1.5} position={{ top: '45%', left: '10%' }}>
        <AccountBalanceWalletIcon fontSize="large" />
      </FloatingIcon>
      
      <FloatingIcon delay={0.5} position={{ top: '60%', right: '10%' }}>
        <LightbulbIcon fontSize="large" />
      </FloatingIcon>

      <Card>
        <StyledTitle variant='h1'>
          LifeTrack
        </StyledTitle>
        
        <StyledCaption variant='subtitle1'>
          Cargando tu experiencia personalizada...
        </StyledCaption>
        
        <ProgressWrapper>
          <CircularProgress 
            color='secondary' 
            size={128}
            thickness={4}
            sx={{
              '& .MuiCircularProgress-svg': {
                strokeLinecap: 'round',
              },
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
            }}
          />
        </ProgressWrapper>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mt: 4,
          }}
        >
          <SpeedIcon sx={{ color: 'primary.main', opacity: 0.7 }} />
          <LocalAtmIcon sx={{ color: 'secondary.main', opacity: 0.7 }} />
          <MonetizationOnIcon sx={{ color: 'primary.main', opacity: 0.7 }} />
        </Box>
        
        <Typography 
          variant='body2' 
          sx={{ 
            display: 'block', 
            mt: 3,
            color: '#555',
            fontStyle: 'italic',
            fontWeight: 500,
          }}
        >
          Estamos preparando todos tus datos financieros y personales
        </Typography>
      </Card>
    </Container>
  );
};

export default Loading;
