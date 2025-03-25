import React, { useState } from 'react';
import {
    Grid, 
    TextField, 
    Paper, 
    Card, 
    CardHeader, 
    IconButton, 
    CardContent, 
    Typography, 
    Chip,
    Box,
    Divider,
    Stack,
    Button,
    Tooltip,
    Alert,
    Zoom,
    useMediaQuery
} from '@mui/material';
import { formatAmount } from '../../utils';
import ReactApexChart from 'react-apexcharts';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SavingsIcon from '@mui/icons-material/Savings';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { database, auth } from '../../firebase';
import { useStore } from '../../store';
import { getDate } from "../../utils";
import { useTheme } from '@mui/material/styles';

const SavingsTab = ({ data }) => {
    const { userData } = useStore();
    const [editPercentageActive, setEditPercentageActive] = useState(false);
    const [newPercentage, setNewPercentage] = useState(
        data?.carMaintenancePercentage ? data.carMaintenancePercentage * 100 : 0
    );
    const [chartType, setChartType] = useState('ARS'); // 'ARS', 'USD', 'car'
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Preparar los arrays para los gráficos
    const seriesCarLineChart = [];
    const seriesCarColumnChart = [];
    const labelsCarChart = [];

    const seriesUSDLineChart = [];
    const seriesUSDColumnChart = [];
    const labelsUSDChart = [];
  
    const seriesARSLineChart = [];
    const seriesARSColumnChart = [];
    const labelsARSChart = [];

    // Comprobar si existen los datos antes de intentar procesarlos
    if (data?.carMaintenanceHistory) {
        Object.keys(data.carMaintenanceHistory).forEach(key => {
            seriesCarLineChart.push(data.carMaintenanceHistory[key].newTotal);
            seriesCarColumnChart.push(data.carMaintenanceHistory[key].amount);
            labelsCarChart.push(data.carMaintenanceHistory[key].date);
        });
    }

    if (data?.amountUSDHistory) {
        Object.keys(data.amountUSDHistory).forEach(key => {
            seriesUSDLineChart.push(data.amountUSDHistory[key].newTotal);
            seriesUSDColumnChart.push(data.amountUSDHistory[key].amountUSD);
            labelsUSDChart.push(data.amountUSDHistory[key].date);
        });
    }

    if (data?.amountARSHistory) {
        Object.keys(data.amountARSHistory).forEach(key => {
            seriesARSLineChart.push(data.amountARSHistory[key].newTotal);
            seriesARSColumnChart.push(data.amountARSHistory[key].amount);
            labelsARSChart.push(data.amountARSHistory[key].date);
        });
    }

    // Configuración base para los gráficos
    const baseChartOptions = {
        tooltip: {
            y: {
                formatter: val => formatAmount(val)
            }
        },
        markers: {
            size: 4,
            hover: {
                size: 6
            }
        },
        stroke: {
            curve: 'smooth',
            width: [3, 2]
        },
        grid: {
            borderColor: theme.palette.divider,
            row: {
                colors: ['transparent', 'transparent'],
                opacity: 0.5
            }
        },
        xaxis: {
            type: 'category',
            labels: {
                rotate: -45,
                rotateAlways: false,
                style: {
                    colors: theme.palette.text.secondary
                }
            }
        },
        yaxis: {
            labels: {
                formatter: val => formatAmount(val),
                style: {
                    colors: theme.palette.text.secondary
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            labels: {
                colors: theme.palette.text.secondary
            }
        },
        chart: {
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            }
        },
        colors: [theme.palette.primary.main, theme.palette.secondary.main]
    };

    const optionsCarChart = {
        ...baseChartOptions,
        labels: labelsCarChart,
        title: {
            text: 'Historial de Fondo de Mantenimiento de Auto',
            align: 'center',
            style: {
                color: theme.palette.text.primary,
                fontSize: '16px',
                fontWeight: 500
            }
        },
    };

    const optionsUSDChart = {
        ...baseChartOptions,
        labels: labelsUSDChart,
        title: {
            text: 'Historial de Ahorros en USD',
            align: 'center',
            style: {
                color: theme.palette.text.primary,
                fontSize: '16px',
                fontWeight: 500
            }
        },
    };

    const optionsARSChart = {
        ...baseChartOptions,
        labels: labelsARSChart,
        title: {
            text: 'Historial de Ahorros en ARS',
            align: 'center',
            style: {
                color: theme.palette.text.primary,
                fontSize: '16px',
                fontWeight: 500
            }
        },
    };

    const editPercentage = () => {
        if (auth.currentUser) {
            database.ref(`${auth.currentUser.uid}/savings/carMaintenancePercentage`).set(parseFloat(newPercentage/100));
            setEditPercentageActive(false);
        }
    };

    const addPendingToTotal = () => {
        if (!auth.currentUser || !userData?.savings?.carMaintenancePending) return;

        const totalRef = database.ref(`${auth.currentUser.uid}/savings`);
        totalRef.transaction((data) => {
            if (data) {
                data.carMaintenance = (data.carMaintenance || 0) + parseInt(data.carMaintenancePending);
            }
            return data;
        });

        database.ref(`${auth.currentUser.uid}/savings/carMaintenancePending`).set(0);

        // Actualizar el valor de ahorros en ARS y su historial
        if (userData?.savings?.amountARS) {
            database.ref(`${auth.currentUser.uid}/savings/amountARS`).set(
                userData.savings.amountARS - userData.savings.carMaintenancePending
            );
            database.ref(`${auth.currentUser.uid}/savings/amountARSHistory`).push({
                date: getDate(),
                amount: -userData.savings.carMaintenancePending,
                newTotal: (userData.savings.amountARS - userData.savings.carMaintenancePending),
            });
        }
    };

    const handleSetEditPercentageActive = () => {
        setEditPercentageActive(!editPercentageActive);
    };

    // Si no hay datos disponibles
    if (!data) {
        return (
            <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minHeight="300px"
                p={3}
            >
                <SavingsIcon 
                    color="disabled" 
                    style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }} 
                />
                <Typography variant="h6" color="textSecondary" align="center" gutterBottom>
                    No hay datos de ahorros disponibles
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                    Tus datos de ahorros aparecerán aquí una vez que los registres.
                </Typography>
            </Box>
        );
    }

    // Componente de tarjeta de resumen
    const SummaryCard = ({ title, value, secondaryValue, icon, color, pendingAmount, onApprove, onEdit, editable }) => {
        return (
            <Card 
                elevation={3} 
                sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[6],
                    },
                    borderTop: `3px solid ${color}`
                }}
            >
                <CardHeader
                    title={
                        <Box display="flex" alignItems="center">
                            <Box 
                                sx={{ 
                                    mr: 1.5, 
                                    bgcolor: `${color}15`,
                                    p: 1,
                                    borderRadius: '50%',
                                    display: 'flex'
                                }}
                            >
                                {React.cloneElement(icon, { style: { color } })}
                            </Box>
                            <Typography variant="h6">{title}</Typography>
                        </Box>
                    }
                    action={
                        pendingAmount ? (
                            <Tooltip title="Aprobar fondos pendientes">
                                <IconButton
                                    color="success"
                                    onClick={onApprove}
                                    size="small"
                                    sx={{ mr: 1 }}
                                >
                                    <CheckIcon />
                                </IconButton>
                            </Tooltip>
                        ) : editable ? (
                            <Tooltip title="Editar">
                                <IconButton
                                    color="primary"
                                    onClick={onEdit}
                                    size="small"
                                    sx={{ mr: 1 }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        ) : null
                    }
                />
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
                            {value}
                        </Typography>
                        
                        {secondaryValue && (
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {secondaryValue}
                            </Typography>
                        )}
                        
                        {pendingAmount && (
                            <Box mt={1}>
                                <Alert 
                                    severity="success" 
                                    icon={<SavingsIcon />}
                                    sx={{ 
                                        '& .MuiAlert-message': { 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%'
                                        } 
                                    }}
                                >
                                    <Typography variant="body2" fontWeight="medium">
                                        Pendiente:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {formatAmount(pendingAmount)}
                                    </Typography>
                                </Alert>
                            </Box>
                        )}
                        
                        {editPercentageActive && editable && (
                            <Box mt={2}>
                                <TextField
                                    label="Nuevo porcentaje"
                                    type="number"
                                    value={newPercentage}
                                    onChange={(e) => setNewPercentage(e.target.value)}
                                    required
                                    fullWidth
                                    margin="normal"
                                    size="small"
                                    InputProps={{
                                        endAdornment: "%",
                                    }}
                                />
                                <Stack direction="row" spacing={1} mt={1}>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        size="small" 
                                        onClick={editPercentage}
                                        startIcon={<CheckIcon />}
                                    >
                                        Guardar
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        size="small" 
                                        onClick={handleSetEditPercentageActive}
                                        startIcon={<CloseIcon />}
                                    >
                                        Cancelar
                                    </Button>
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
        );
    };
    
    // Renderizar el gráfico seleccionado
    const renderSelectedChart = () => {
        switch (chartType) {
            case 'ARS':
                return seriesARSLineChart.length > 0 ? (
                    <ReactApexChart
                        options={optionsARSChart}
                        series={[
                            {name: 'Acumulado', type: 'line', data: seriesARSLineChart},
                            {name: 'Transacción', type: 'column', data: seriesARSColumnChart}
                        ]}
                        type="line"
                        height={isMobile ? 400 : 500}
                    />
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column',
                        height: 300,
                        opacity: 0.7
                    }}>
                        <AnalyticsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography color="textSecondary" align="center">
                            No hay datos de historial en ARS para mostrar
                        </Typography>
                    </Box>
                );
            case 'USD':
                return seriesUSDLineChart.length > 0 ? (
                    <ReactApexChart
                        options={optionsUSDChart}
                        series={[
                            {name: 'Acumulado', type: 'line', data: seriesUSDLineChart},
                            {name: 'Transacción', type: 'column', data: seriesUSDColumnChart}
                        ]}
                        type="line"
                        height={isMobile ? 400 : 500}
                    />
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column',
                        height: 300,
                        opacity: 0.7
                    }}>
                        <AnalyticsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography color="textSecondary" align="center">
                            No hay datos de historial en USD para mostrar
                        </Typography>
                    </Box>
                );
            case 'car':
                return seriesCarLineChart.length > 0 ? (
                    <ReactApexChart
                        options={optionsCarChart}
                        series={[
                            {name: 'Acumulado', type: 'line', data: seriesCarLineChart},
                            {name: 'Transacción', type: 'column', data: seriesCarColumnChart}
                        ]}
                        type="line"
                        height={isMobile ? 400 : 500}
                    />
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column',
                        height: 300,
                        opacity: 0.7
                    }}>
                        <AnalyticsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography color="textSecondary" align="center">
                            No hay datos de historial de mantenimiento de auto para mostrar
                        </Typography>
                    </Box>
                );
            default:
                return null;
        }
    };
    
    return (
        <Box sx={{ pb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box mb={1}>
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                            Resumen de Ahorros
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestiona tus ahorros en diferentes monedas y fondos
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                </Grid>
                
                {/* Tarjetas de resumen */}
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard 
                        title="Ahorros en ARS"
                        value={data.amountARS !== undefined ? formatAmount(data.amountARS) : 'N/A'}
                        icon={<MonetizationOnIcon />}
                        color={theme.palette.success.main}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard 
                        title="Ahorros en USD"
                        value={data.amountUSD !== undefined ? formatAmount(data.amountUSD) : 'N/A'}
                        icon={<AttachMoneyIcon />}
                        color={theme.palette.info.main}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard 
                        title="Fondo Mantenimiento"
                        value={data.carMaintenance !== undefined ? formatAmount(data.carMaintenance) : 'N/A'}
                        icon={<DirectionsCarIcon />}
                        color={theme.palette.warning.main}
                        pendingAmount={data.carMaintenancePending}
                        onApprove={addPendingToTotal}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard 
                        title="% Mantenimiento"
                        value={data.carMaintenancePercentage !== undefined ? `${(data.carMaintenancePercentage * 100).toFixed(1)}%` : 'N/A'}
                        secondaryValue="Porcentaje destinado al mantenimiento del auto"
                        icon={<CurrencyExchangeIcon />}
                        color={theme.palette.secondary.main}
                        editable={true}
                        onEdit={handleSetEditPercentageActive}
                    />
                </Grid>
                
                {/* Chart selector */}
                <Grid item xs={12}>
                    <Card elevation={3} sx={{ mt: 2 }}>
                        <CardHeader 
                            title={
                                <Box display="flex" alignItems="center">
                                    <AnalyticsIcon color="primary" sx={{ mr: 1.5 }} />
                                    <Typography variant="h6">Historial de Ahorros</Typography>
                                </Box>
                            }
                            action={
                                <Stack direction="row" spacing={1}>
                                    <Tooltip title="Historial en ARS">
                                        <Zoom in={true}>
                                            <Button 
                                                variant={chartType === 'ARS' ? 'contained' : 'outlined'}
                                                color="primary"
                                                size="small"
                                                onClick={() => setChartType('ARS')}
                                                startIcon={<MonetizationOnIcon />}
                                            >
                                                ARS
                                            </Button>
                                        </Zoom>
                                    </Tooltip>
                                    <Tooltip title="Historial en USD">
                                        <Zoom in={true}>
                                            <Button 
                                                variant={chartType === 'USD' ? 'contained' : 'outlined'}
                                                color="info"
                                                size="small"
                                                onClick={() => setChartType('USD')}
                                                startIcon={<AttachMoneyIcon />}
                                            >
                                                USD
                                            </Button>
                                        </Zoom>
                                    </Tooltip>
                                    <Tooltip title="Historial Fondo Mantenimiento">
                                        <Zoom in={true}>
                                            <Button 
                                                variant={chartType === 'car' ? 'contained' : 'outlined'}
                                                color="warning"
                                                size="small"
                                                onClick={() => setChartType('car')}
                                                startIcon={<DirectionsCarIcon />}
                                            >
                                                Auto
                                            </Button>
                                        </Zoom>
                                    </Tooltip>
                                </Stack>
                            }
                        />
                        <Divider />
                        <CardContent sx={{ pt: 3, px: 3, pb: 3 }}>
                            {renderSelectedChart()}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SavingsTab;