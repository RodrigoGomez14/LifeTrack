import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  Stack,
  alpha,
  useMediaQuery,
  Card,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';

const ConfigTabsLayout = ({ tabsData, activeTab, onTabChange, children, actions }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Card
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <SettingsIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="600">
              Configuración
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Personaliza tu experiencia y gestiona tus preferencias
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {/* Navegación lateral */}
        <Grid item xs={12} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden',
            }}
          >
            <Tabs
              orientation={isMobile ? 'horizontal' : 'vertical'}
              variant={isMobile ? 'scrollable' : 'standard'}
              value={activeTab}
              onChange={onTabChange}
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  px: 3,
                  py: 2,
                  borderRadius: 0,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  },
                },
              }}
            >
              {tabsData.map((tab, index) => (
                <Tab
                  key={index}
                  icon={
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <tab.icon sx={{ mr: 2, fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                        {tab.label}
                      </Typography>
                    </Box>
                  }
                  sx={{ justifyContent: 'flex-start' }}
                />
              ))}
            </Tabs>
          </Card>
        </Grid>

        {/* Contenido principal */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 3 }}>{children}</Box>

          {actions && <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{actions}</Box>}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ConfigTabsLayout;
