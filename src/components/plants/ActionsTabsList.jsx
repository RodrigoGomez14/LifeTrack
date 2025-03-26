import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  Divider, 
  Paper,
  Avatar,
  Chip,
  alpha
} from '@mui/material';
import { convertToDetailedDate } from '../../utils';
import OpacityIcon from '@mui/icons-material/Opacity';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ScienceIcon from '@mui/icons-material/Science';
import ForestIcon from '@mui/icons-material/Forest';
import { useTheme } from '@mui/material/styles';

const ActionsTabsList = ({ data, type }) => {
  const theme = useTheme();
  
  if (!data || Object.keys(data).length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        p: 4, 
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        borderRadius: 2,
        border: `1px dashed ${theme.palette.divider}`
      }}>
        <ForestIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.2), mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          No se han registrado {type} aún
        </Typography>
      </Box>
    );
  }
  
  // Ordenar las acciones por fecha (más recientes primero)
  const sortedActions = Object.entries(data)
    .map(([key, action]) => ({ id: key, ...action }))
    .sort((a, b) => {
      // Convertir fechas (DD/MM/YYYY) a formato comparable
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      
      return dateB - dateA; // Ordenar descendente (más recientes primero)
    });
  
  const getIcon = () => {
    switch (type) {
      case 'riegos':
        return <OpacityIcon sx={{ color: theme.palette.info.main }} />;
      case 'insecticidas':
        return <BugReportIcon sx={{ color: theme.palette.error.main }} />;
      case 'podas':
        return <ContentCutIcon sx={{ color: theme.palette.success.main }} />;
      case 'transplantes':
        return <SwapHorizIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <ScienceIcon />;
    }
  };
  
  const getColor = () => {
    switch (type) {
      case 'riegos':
        return theme.palette.info.main;
      case 'insecticidas':
        return theme.palette.error.main;
      case 'podas':
        return theme.palette.success.main;
      case 'transplantes':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const renderSecondaryContent = (action) => {
    switch (type) {
      case 'riegos':
        return (
          <Box>
            <Typography variant="body2">
              Cantidad: {action.quantity} ml
            </Typography>
            {action.aditives && action.aditives.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" gutterBottom>
                  Aditivos:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {action.aditives.map((aditivo, index) => (
                    <Chip 
                      key={index}
                      label={`${aditivo.name} - ${aditivo.dosis}`}
                      size="small"
                      sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );
        
      case 'insecticidas':
        return (
          <Box>
            <Typography variant="body2">
              Producto: {action.product}
            </Typography>
            <Typography variant="body2">
              Método de aplicación: {action.appMethod}
            </Typography>
          </Box>
        );
        
      case 'podas':
        return (
          <Typography variant="body2">
            Tipo: {action.type}
          </Typography>
        );
        
      case 'transplantes':
        return (
          <Box>
            <Typography variant="body2">
              Maceta anterior: {action.previousPot}L
            </Typography>
            <Typography variant="body2">
              Nueva maceta: {action.newPot}L
            </Typography>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <List disablePadding>
      {sortedActions.map((action, index) => (
        <React.Fragment key={action.id}>
          <Paper 
            elevation={1} 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}
          >
            <ListItem 
              sx={{ 
                py: 1.5,
                px: 2,
                borderLeft: `4px solid ${getColor()}`,
                bgcolor: alpha(getColor(), 0.05)
              }}
            >
              <Box sx={{ mr: 1.5 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(getColor(), 0.1),
                    color: getColor()
                  }}
                >
                  {getIcon()}
                </Avatar>
              </Box>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="medium">
                    {convertToDetailedDate(action.date)}
                  </Typography>
                }
                secondary={renderSecondaryContent(action)}
                secondaryTypographyProps={{ component: 'div' }}
              />
            </ListItem>
          </Paper>
        </React.Fragment>
      ))}
    </List>
  );
};

export default ActionsTabsList;
