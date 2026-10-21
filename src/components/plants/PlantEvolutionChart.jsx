import React, { useMemo, useRef, useCallback } from 'react';
import Chart from 'react-apexcharts';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { parseDateToTimestamp } from './plantsHelpers';

const DAY_MS = 24 * 60 * 60 * 1000;

const tsToLabel = (ts) => {
  const d = new Date(ts);
  return `${d.getUTCDate().toString().padStart(2, '0')}/${(d.getUTCMonth() + 1).toString().padStart(2, '0')}`;
};

// Rellena linealmente los `null` internos de una serie: entre el último valor
// conocido y el siguiente, reparte la diferencia en partes iguales según los días.
// Los `null` iniciales/finales quedan intactos (no inventamos fuera de lo medido).
const interpolateGaps = (arr) => {
  const out = arr.slice();
  let prevIdx = -1;
  for (let i = 0; i < out.length; i++) {
    if (out[i] == null) continue;
    if (prevIdx !== -1) {
      const span = i - prevIdx;
      if (span > 1) {
        const from = out[prevIdx];
        const to = out[i];
        for (let k = 1; k < span; k++) {
          out[prevIdx + k] = Math.round((from + ((to - from) * k) / span) * 100) / 100;
        }
      }
    }
    prevIdx = i;
  }
  return out;
};

const PlantEvolutionChart = ({ plant, stageRanges = [], timeline = [] }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  if (!plant || !plant.birthDate) return null;

  return (
    <PlantEvolutionChartInner plant={plant} stageRanges={stageRanges} timeline={timeline} theme={theme} isDesktop={isDesktop} />
  );
};

const PlantEvolutionChartInner = ({ plant, stageRanges, timeline, theme, isDesktop }) => {
  const multiActionRef = useRef(new Map());

  const { series, categories, xAnnotations, multiMap, markerSizes } = useMemo(() => {
    const birthTs = parseDateToTimestamp(plant.birthDate);
    if (!birthTs) return { series: [], categories: [], xAnnotations: [], multiMap: new Map(), markerSizes: [] };

    const now = new Date();
    const todayTs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const totalDays = Math.floor((todayTs - birthTs) / DAY_MS);
    if (totalDays <= 0) return { series: [], categories: [], xAnnotations: [], multiMap: new Map(), markerSizes: [] };

    const rawEntries = [
      ...(plant.irrigations ? Object.values(plant.irrigations) : []),
      ...(plant.logs ? Object.values(plant.logs) : []),
    ]
      .filter((e) => e.date && (e.ph !== undefined || e.ec !== undefined || e.ppm !== undefined || e.waterTemp !== undefined))
      .sort((a, b) => (parseDateToTimestamp(a.date) || 0) - (parseDateToTimestamp(b.date) || 0));

    let lastPh = null;
    let lastEc = null;
    let lastPpm = null;
    let lastTemp = null;
    const measurementPoints = [];
    rawEntries.forEach((e) => {
      const ts = parseDateToTimestamp(e.date);
      if (!ts) return;
      if (e.ph !== undefined) lastPh = e.ph;
      if (e.ec !== undefined) lastEc = e.ec * 500;
      if (e.ppm !== undefined) lastPpm = e.ppm;
      if (e.waterTemp !== undefined) lastTemp = e.waterTemp;
      measurementPoints.push({ ts, ph: lastPh, ec: lastEc, ppm: lastPpm, temp: lastTemp });
    });

    const cats = [];
    const phArr = [];
    const ecArr = [];
    const ppmArr = [];
    const tempArr = [];
    const measured = [];

    // Mapa de mediciones agrupadas por label DD/MM (solo datos del día exacto)
    const measurementsByDay = new Map();
    measurementPoints.forEach((mp) => {
      measurementsByDay.set(tsToLabel(mp.ts), mp);
    });

    for (let d = 0; d <= totalDays; d++) {
      const label = tsToLabel(birthTs + d * DAY_MS);
      cats.push(label);
      const m = measurementsByDay.get(label);
      measured.push(m != null);
      phArr.push(m?.ph ?? null);
      ecArr.push(m?.ec ?? null);
      ppmArr.push(m?.ppm ?? null);
      tempArr.push(m?.temp ?? null);
    }

    // Unimos los huecos interpolando entre la última y la próxima medición de cada serie.
    const phData = interpolateGaps(phArr);
    const ecData = interpolateGaps(ecArr);
    const ppmData = interpolateGaps(ppmArr);
    const tempData = interpolateGaps(tempArr);

    // Los marcadores (puntos) solo se dibujan en los días con medición real;
    // los tramos interpolados quedan como línea lisa.
    const markerSizes = measured.map((has) => (has ? 3 : 0));

    const result = [];
    if (phData.some((v) => v != null)) result.push({ name: 'pH', data: phData, color: '#4CAF50' });
    if (ecData.some((v) => v != null)) result.push({ name: 'EC', data: ecData, color: '#2196F3' });
    if (ppmData.some((v) => v != null)) result.push({ name: 'PPM', data: ppmData, color: '#FF9800' });
    if (tempData.some((v) => v != null)) result.push({ name: 'Temp', data: tempData, color: '#E91E63' });

    // --- Anotaciones ---
    const catSet = new Set(cats);
    const lastCat = cats[cats.length - 1] || '';
    const xAnnot = [];

    // Bandas de etapa
    stageRanges.forEach((r) => {
      const startLbl = tsToLabel(r.start);
      let endLbl = tsToLabel(r.end);
      if (!catSet.has(startLbl)) return;
      if (!catSet.has(endLbl)) endLbl = lastCat;
      if (startLbl === endLbl && cats.length > 1) return;
      xAnnot.push({
        x: startLbl,
        x2: endLbl,
        fillColor: r.color,
        opacity: 0.08,
      });
    });

    // Líneas de acción agrupadas por fecha (excluyendo logs y cambios de etapa)
    const dateGroups = new Map();
    timeline.forEach((e) => {
      if (e.type === 'log' || e.type === 'stageChange' || e.type === 'birth') return;
      if (!dateGroups.has(e.date)) dateGroups.set(e.date, []);
      dateGroups.get(e.date).push(e);
    });

    const multiMap = new Map();
    dateGroups.forEach((events, date) => {
      const ts = parseDateToTimestamp(date);
      if (!ts) return;
      const lbl = tsToLabel(ts);
      if (!catSet.has(lbl)) return;
      const annoId = `multi-accion-${lbl.replace(/\//g, '-')}`;
      const colors = events.map((e) => e.color);
      if (colors.length > 1) {
        multiMap.set(annoId, colors);
      }
      xAnnot.push({
        id: annoId,
        x: lbl,
        borderColor: colors[0],
        strokeDashArray: 3,
        opacity: 0.5,
        label: { text: '' },
      });
    });

    return { series: result, categories: cats, xAnnotations: xAnnot, multiMap, markerSizes };
  }, [plant, stageRanges, timeline, theme.typography.fontFamily]);

  // Sincronizar el ref con el mapa calculado
  React.useEffect(() => {
    multiActionRef.current = multiMap;
  }, [multiMap]);

  // Manipulación post-render: dividir líneas de multi-acción en segmentos de colores
  const handleChartRender = useCallback(() => {
    const multiMap = multiActionRef.current;
    if (!multiMap || multiMap.size === 0) return;

    const svg = document.querySelector('.apexcharts-svg');
    if (!svg) return;

    const annotGroup = svg.querySelector('.apexcharts-xaxis-annotations');
    if (!annotGroup) return;

    // Limpiar clones previos y restaurar líneas originales ocultas
    annotGroup.querySelectorAll('[data-multi-clone="true"]').forEach((el) => el.remove());
    multiMap.forEach((_, annoId) => {
      const orig = annotGroup.querySelector(`line.${annoId}`);
      if (orig) orig.style.display = '';
    });

    const SVG_NS = 'http://www.w3.org/2000/svg';

    multiMap.forEach((colors, annoId) => {
      const line = annotGroup.querySelector(`line.${annoId}`);
      if (!line) return;

      const y1 = parseFloat(line.getAttribute('y1')) || 0;
      const y2 = parseFloat(line.getAttribute('y2')) || 0;
      const x1 = line.getAttribute('x1');
      const x2 = line.getAttribute('x2');
      const dashArray = line.getAttribute('stroke-dasharray') || '3';
      const totalH = y2 - y1;
      if (totalH <= 0) return;

      // Ocultar la línea original
      line.style.display = 'none';

      // Crear N líneas nuevas, una por color
      const segH = totalH / colors.length;
      colors.forEach((color, i) => {
        const seg = document.createElementNS(SVG_NS, 'line');
        seg.setAttribute('x1', x1);
        seg.setAttribute('x2', x2);
        seg.setAttribute('y1', String(y1 + segH * i));
        seg.setAttribute('y2', String(y1 + segH * (i + 1)));
        seg.setAttribute('stroke', color);
        seg.setAttribute('stroke-dasharray', dashArray);
        seg.setAttribute('stroke-width', '1');
        seg.setAttribute('opacity', '0.5');
        seg.setAttribute('data-multi-clone', 'true');
        annotGroup.appendChild(seg);
      });
    });
  }, []);

  const options = useMemo(() => {
    const yaxes = [];
    if (series.some((s) => s.name === 'pH')) {
      const phAxis = {
        seriesName: 'pH',
        min: 4, max: 8, tickAmount: 4,
        decimalsInFloat: 2,
        labels: {
          show: isDesktop,
          style: { colors: '#fff', fontSize: '10px' },
        },
      };
      if (isDesktop) phAxis.title = { text: 'pH', style: { color: '#fff', fontSize: '11px' } };
      yaxes.push(phAxis);
    }
    if (series.some((s) => s.name === 'EC' || s.name === 'PPM')) {
      const ppmAxis = {
        seriesName: 'EC',
        opposite: true,
        decimalsInFloat: 2,
        labels: {
          show: isDesktop,
          style: { colors: '#fff', fontSize: '10px' },
        },
      };
      if (isDesktop) ppmAxis.title = { text: 'PPM', style: { color: '#fff', fontSize: '11px' } };
      yaxes.push(ppmAxis);
      yaxes.push({ seriesName: 'PPM', opposite: true, show: false });
    }
    if (series.some((s) => s.name === 'Temp')) {
      const tempAxis = {
        seriesName: 'Temp',
        min: 10, max: 35, tickAmount: 5,
        decimalsInFloat: 2,
        labels: {
          show: isDesktop,
          style: { colors: '#fff', fontSize: '10px' },
        },
      };
      if (isDesktop) tempAxis.title = { text: '°C', style: { color: '#fff', fontSize: '11px' } };
      yaxes.push(tempAxis);
    }

    return {
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        foreColor: theme.palette.text.secondary,
        fontFamily: theme.typography.fontFamily,
        background: 'transparent',
        events: {
          mounted: handleChartRender,
          updated: handleChartRender,
        },
      },
      stroke: { width: 2.5, curve: 'smooth' },
      markers: { size: markerSizes, strokeWidth: 0 },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
      xaxis: {
        categories,
        labels: { style: { fontSize: '10px' } },
        tickAmount: Math.min(categories.length, 10),
      },
      yaxis: yaxes.length > 0 ? yaxes : [
        { min: 4, max: 8, tickAmount: 4, labels: { show: false } },
      ],
      colors: series.map((s) => s.color),
      tooltip: {
        shared: true,
        intersect: false,
        followCursor: true,
        theme: undefined,
        y: {
          formatter: (value, { seriesIndex, w }) => {
            if (value == null) return '-';
            const seriesName = w.config.series[seriesIndex]?.name;
            if (seriesName === 'EC') return `${(value / 500).toFixed(2)} mS/cm`;
            if (seriesName === 'pH') return value.toFixed(2);
            if (seriesName === 'PPM') return `${value} ppm`;
            if (seriesName === 'Temp') return `${value}°C`;
            return String(value);
          },
        },
      },
      legend: { show: true, position: 'top', horizontalAlign: 'right', fontSize: '11px', markers: { radius: 4 } },
      annotations: { xaxis: xAnnotations },
    };
  }, [categories, series, xAnnotations, markerSizes, theme, isDesktop]);

  if (series.length === 0) {
    return null;
  }

  return (
    <Box sx={{
      mt: 1,
      width: isDesktop ? '90vw' : '95vw',
      ml: isDesktop ? 'calc(50% - 45vw)' : 'calc(50% - 47.5vw)',
      '& .apexcharts-tooltip': {
        background: `${theme.palette.background.default} !important`,
        color: `${theme.palette.text.primary} !important`,
        border: `1px solid ${theme.palette.divider} !important`,
        borderRadius: '8px !important',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15) !important',
      },
      '& .apexcharts-tooltip-title': {
        background: `${theme.palette.background.paper} !important`,
        color: `${theme.palette.text.primary} !important`,
        borderBottom: `1px solid ${theme.palette.divider} !important`,
        fontWeight: 600,
      },
      '& .apexcharts-tooltip-series-group': {
        background: 'transparent !important',
      },
    }}>
      <Chart options={options} series={series} type="line" height={350} />
    </Box>
  );
};

export default PlantEvolutionChart;
