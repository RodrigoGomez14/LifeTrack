import React, { useState, useEffect } from 'react';
import { CircularProgress, Typography, Box, Container, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Mensajes de carga rotativos
const loadingMessages = [
  "Preparando tu experiencia personalizada...",
  "Cargando tus datos financieros...",
  "Actualizando información de gastos...",
  "Sincronizando tus ahorros...",
  "Casi listo..."
];

// Animación para el pulso del texto
const pulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
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
    background-position: -200px;
  }
  40%, 100% {
    background-position: 400px;
  }
`;

// Animación para el progreso circular
const progressPulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.3);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 15px rgba(66, 133, 244, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
  }
`;

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  backgroundClip: 'text',
  textFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${pulse} 2s infinite ease-in-out`,
  marginBottom: theme.spacing(3),
  fontSize: '4rem',
  position: 'relative',
  letterSpacing: '-0.02em',
  textShadow: '0 10px 30px rgba(0,0,0,0.1)',
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

const ProgressWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(4),
  animation: `${progressPulse} 2s infinite`,
  '& .MuiCircularProgress-root': {
    transition: 'all 0.3s ease',
  },
}));

const FloatingIcon = styled(IconButton)(({ theme, delay = 0, position = {} }) => ({
  position: 'absolute',
  color: theme.palette.primary.main,
  animation: `${float} 4s infinite ease-in-out`,
  animationDelay: `${delay}s`,
  opacity: 0.7,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(8px)',
  padding: theme.spacing(1.5),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  ...position,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: 'scale(1.1)',
    opacity: 1,
  },
}));

const Background = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
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
    backgroundSize: '30px 30px',
    transform: 'translate(-50%, -50%) rotate(30deg)',
    animation: 'backgroundMove 30s linear infinite',
  },
}));

const Card = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  borderRadius: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(20px)',
  maxWidth: '90%',
  width: '500px',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  transition: 'all 0.3s ease',
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

const Loading = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotación de mensajes
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    // Simulación de progreso
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + 15;
        return nextProgress >= 100 ? 0 : nextProgress;
      });
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

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
      
      {/* Íconos flotantes */}
      <FloatingIcon delay={0} position={{ top: '15%', left: '20%' }}>
        <MonetizationOnIcon sx={{ fontSize: 32 }} />
      </FloatingIcon>
      
      <FloatingIcon delay={1.2} position={{ top: '25%', right: '15%' }}>
        <DirectionsCarIcon sx={{ fontSize: 32 }} />
      </FloatingIcon>
      
      <FloatingIcon delay={0.8} position={{ bottom: '20%', left: '25%' }}>
        <LocalFloristIcon sx={{ fontSize: 32 }} />
      </FloatingIcon>
      
      <FloatingIcon delay={2.2} position={{ bottom: '30%', right: '20%' }}>
        <SavingsIcon sx={{ fontSize: 32 }} />
      </FloatingIcon>
      
      <FloatingIcon delay={1.5} position={{ top: '45%', left: '10%' }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
      </FloatingIcon>
      
      <FloatingIcon delay={0.5} position={{ top: '60%', right: '10%' }}>
        <LightbulbIcon sx={{ fontSize: 32 }} />
      </FloatingIcon>

      <Card>
        <StyledTitle variant='h1'>
          LifeTrack
        </StyledTitle>
        
        <Typography 
          variant='h6' 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500,
            opacity: 0.9,
            animation: `${pulse} 3s infinite ease-in-out`,
            animationDelay: '0.5s',
          }}
        >
          {loadingMessages[messageIndex]}
        </Typography>
        
        <ProgressWrapper>
          <CircularProgress 
            variant="determinate"
            value={progress}
            size={120}
            thickness={4}
            sx={{
              color: 'primary.main',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
                transition: 'all 0.3s ease',
              },
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'primary.main',
              fontWeight: 'bold',
            }}
          >
            {`${Math.round(progress)}%`}
          </Typography>
        </ProgressWrapper>
        
        <Typography 
          variant='body2' 
          sx={{ 
            mt: 4,
            color: 'text.secondary',
            fontStyle: 'italic',
            opacity: 0.8,
            maxWidth: '80%',
            mx: 'auto',
          }}
        >
          Optimizando tu experiencia para brindarte el mejor servicio
        </Typography>
      </Card>
    </Container>
  );
};

export default Loading;
