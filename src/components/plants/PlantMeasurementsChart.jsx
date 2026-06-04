import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Box, Typography, useTheme } from '@mui/material';

const PlantMeasurementsChart = ({ plant, days = 30 }) => {
  const theme = useTheme();

  const series = useMemo(() => {
    const allEntries = [
      ...(plant.logs ? Object.values(plant.logs) : []),
      ...(plant.irrigations ? Object.values(plant.irrigations) : []),
    ]
      .filter((e) => e.date)
      .sort((a, b) => {
        const parse = (d) => { const [dd, mm, yyyy] = (d || '1/1/2000').split('/'); return new Date(+yyyy, +mm - 1, +dd); };
        return parse(a.date) - parse(b.date);
      });

    if (allEntries.length === 0) return [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const filtered = allEntries.filter((irr) => {
      const [dd, mm, yyyy] = (irr.date || '1/1/2000').split('/');
      return new Date(+yyyy, +mm - 1, +dd) >= cutoff;
    });

    // Extender entradas incompletas (pH-only) con valores del último entry completo
    let lastComplete = null;
    const extended = filtered.map((entry) => {
      const isComplete = entry.ph !== undefined && entry.ec !== undefined && entry.ppm !== undefined;
      if (isComplete) {
        lastComplete = entry;
        return entry;
      }
      if (entry.ph !== undefined && lastComplete) {
        return {
          ...entry,
          ec: lastComplete.ec ?? null,
          ppm: lastComplete.ppm ?? null,
          waterTemp: lastComplete.waterTemp ?? null,
        };
      }
      return entry;
    });

    const categories = extended.map((e) => {
      const [d, m] = e.date.split('/');
      return `${d}/${m}`;
    });

    const result = [];
    if (extended.some((e) => e.ph !== undefined)) {
      result.push({ name: 'pH', data: extended.map((e) => e.ph ?? null), color: '#4CAF50' });
    }
    if (extended.some((e) => e.ec !== undefined)) {
      result.push({ name: 'EC (mS/cm)', data: extended.map((e) => e.ec ?? null), color: '#2196F3' });
    }
    if (extended.some((e) => e.ppm !== undefined)) {
      result.push({ name: 'PPM', data: extended.map((e) => e.ppm ?? null), color: '#FF9800' });
    }
    return result.map((s) => ({ ...s, _categories: categories }));
  }, [plant, days]);

  const categories = series[0]?._categories || [];

  const options = useMemo(() => ({
    chart: {
      type: 'line',
      height: 220,
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
    },
    stroke: { width: 2.5, curve: 'smooth' },
    markers: { size: 3, strokeWidth: 0 },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
    xaxis: { categories, labels: { style: { fontSize: '10px' } } },
    yaxis: [
      { title: { text: 'pH', style: { fontSize: '10px' } }, min: 4, max: 8, tickAmount: 4, labels: { formatter: (v) => v.toFixed(1) } },
      { opposite: true, title: { text: 'EC / PPM', style: { fontSize: '10px' } }, labels: { formatter: (v) => Math.round(v) } },
    ],
    colors: series.map((s) => s.color),
    tooltip: { shared: true, intersect: false },
    legend: { show: true, position: 'top', horizontalAlign: 'right', fontSize: '11px', markers: { radius: 4 } },
  }), [theme, categories, series]);

  if (series.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">Sin mediciones aún. Registrá tu primera medición.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ '& .apexcharts-tooltip': { color: '#000' } }}>
      <Chart options={options} series={series.map(({ _categories, ...s }) => s)} type="line" height={220} />
    </Box>
  );
};

export default PlantMeasurementsChart;
