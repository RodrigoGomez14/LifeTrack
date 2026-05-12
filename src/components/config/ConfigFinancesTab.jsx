import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Slider,
  Select,
  MenuItem,
  FormControl,
  alpha,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ConfigFinancesTab = ({
  defaultCurrency,
  setDefaultCurrency,
  budgetPeriod,
  setBudgetPeriod,
  showCents,
  setShowCents,
  roundingEnabled,
  setRoundingEnabled,
  savingsGoal,
  setSavingsGoal,
}) => {
  const theme = useTheme();

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Configuración de finanzas
        </Typography>

        {/* Configuración básica */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Configuración básica
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Moneda predeterminada
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ARS">Peso Argentino (ARS)</MenuItem>
                <MenuItem value="USD">Dólar Estadounidense (USD)</MenuItem>
                <MenuItem value="EUR">Euro (EUR)</MenuItem>
                <MenuItem value="GBP">Libra Esterlina (GBP)</MenuItem>
                <MenuItem value="JPY">Yen Japonés (JPY)</MenuItem>
                <MenuItem value="CAD">Dólar Canadiense (CAD)</MenuItem>
                <MenuItem value="AUD">Dólar Australiano (AUD)</MenuItem>
                <MenuItem value="CHF">Franco Suizo (CHF)</MenuItem>
                <MenuItem value="CNY">Yuan Chino (CNY)</MenuItem>
                <MenuItem value="BRL">Real Brasileño (BRL)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Período de presupuesto
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={budgetPeriod}
                onChange={(e) => setBudgetPeriod(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="monthly">Mensual</MenuItem>
                <MenuItem value="quarterly">Trimestral</MenuItem>
                <MenuItem value="yearly">Anual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Opciones de visualización */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Opciones de visualización
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={showCents}
                  onChange={(e) => setShowCents(e.target.checked)}
                  color="primary"
                />
              }
              label="Mostrar centavos en los montos"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={roundingEnabled}
                  onChange={(e) => setRoundingEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Redondear montos automáticamente"
            />
          </Grid>
        </Grid>

        {/* Meta de ahorro */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Meta de ahorro mensual
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Slider
            value={savingsGoal}
            onChange={(e, newValue) => setSavingsGoal(newValue)}
            min={0}
            max={100000}
            step={1000}
            sx={{ flex: 1 }}
            color="primary"
          />
          <TextField
            value={savingsGoal}
            onChange={(e) => setSavingsGoal(Number(e.target.value))}
            variant="outlined"
            size="small"
            type="number"
            sx={{
              width: 140,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment:
                defaultCurrency === 'ARS' ? '$' : defaultCurrency === 'USD' ? 'US$' : '€',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConfigFinancesTab;
