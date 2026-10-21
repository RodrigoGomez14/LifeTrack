import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, Tooltip, alpha } from '@mui/material';
import { useTheme, lighten } from '@mui/material/styles';
import { Reorder, useDragControls } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useReorder } from './useReorder';

const COL_W = 46;
const NAME_W = 180;

// Etapas con semanas de nutrientes. El cronograma es la fuente de verdad de las dosis.
const STAGES_DEF = [
  { key: 'Vegetativo', label: 'VEGETATIVO', color: '#43a047', weeks: 4 },
  { key: 'Floracion', label: 'FLORACIÓN', color: '#e53935', weeks: 9 },
];

// Celda editable (se guarda al perder el foco / Enter).
const PlanCell = ({ value, onCommit, color, tint }) => {
  const [local, setLocal] = useState(value ?? '');

  useEffect(() => { setLocal(value ?? ''); }, [value]);

  const commit = () => {
    const parsed = parseFloat(String(local).replace(',', '.'));
    const v = Number.isFinite(parsed) ? parsed : 0;
    if (v !== (Number(value) || 0)) onCommit(v);
  };

  const filled = Number(value) > 0;

  return (
    <Box
      sx={{
        width: COL_W,
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRight: '1px solid',
        borderColor: 'divider',
        py: 0.5,
        bgcolor: tint ? alpha(tint, 0.045) : 'transparent',
      }}
    >
      <Box
        component="input"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        placeholder="—"
        inputMode="decimal"
        sx={{
          width: COL_W - 10,
          textAlign: 'center',
          bgcolor: 'transparent',
          border: 'none',
          outline: 'none',
          color: filled ? (color || 'text.primary') : 'text.disabled',
          fontWeight: filled ? 700 : 400,
          fontSize: '0.8rem',
          fontFamily: 'inherit',
          '&::placeholder': { color: 'text.disabled' },
        }}
      />
    </Box>
  );
};

// Fila arrastrable. El drag arranca sólo desde el handle (dragListener={false})
// para no pelear con los inputs de dosis ni con el scroll horizontal.
const NutrientRow = ({ nutrient, plan, onSetNutrient, onDeleteNutrient, stickyName }) => {
  const theme = useTheme();
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <Reorder.Item
      as="div"
      value={nutrient.id}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      whileDrag={{ boxShadow: theme.shadows[6], zIndex: 4 }}
    >
      <Box
        sx={{
          display: 'flex',
          borderTop: '1px solid',
          borderColor: 'divider',
          // Opaco mientras se arrastra, para que no se vean las filas de atrás.
          bgcolor: dragging ? 'background.paper' : 'transparent',
          transition: '0.12s',
          '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.15) },
        }}
      >
        <Box sx={{ ...stickyName, display: 'flex', alignItems: 'center', gap: 0.25, pl: 0.25, pr: 1, py: 0.5 }}>
          <Tooltip title="Arrastrar para reordenar">
            <IconButton
              size="small"
              aria-label={`Reordenar ${nutrient.name}`}
              onPointerDown={(e) => controls.start(e)}
              sx={{
                cursor: 'grab',
                color: 'text.disabled',
                touchAction: 'none',
                '&:hover': { color: 'text.secondary' },
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }} noWrap>{nutrient.name}</Typography>
            {nutrient.brand && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }} noWrap>{nutrient.brand}</Typography>
            )}
          </Box>
          <Tooltip title="Quitar de la biblioteca">
            <IconButton size="small" onClick={() => onDeleteNutrient(nutrient.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
        {STAGES_DEF.map((st) =>
          Array.from({ length: st.weeks }, (_, i) => i + 1).map((w) => (
            <PlanCell
              key={`${nutrient.id}-${st.key}-${w}`}
              value={plan?.[st.key]?.[w]?.nutrients?.[nutrient.id]?.mlPerL}
              tint={st.color}
              onCommit={(v) => onSetNutrient(st.key, w, nutrient.id, v)}
            />
          ))
        )}
      </Box>
    </Reorder.Item>
  );
};

const CronogramaTable = ({ nutrients, plan, onSetNutrient, onSetParam, onAddNutrient, onDeleteNutrient, onReorderNutrients }) => {
  const theme = useTheme();
  const totalWeeks = STAGES_DEF.reduce((s, st) => s + st.weeks, 0);
  // Fila "SEMANAS": más clara que el paper, para que divida con luz.
  const dividerBg = lighten(theme.palette.background.paper, 0.16);
  const { ordered, reorder } = useReorder(nutrients, onReorderNutrients);

  if (nutrients.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No hay nutrientes en la biblioteca.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAddNutrient}
          sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}>
          Agregar nutriente
        </Button>
      </Box>
    );
  }

  const stickyName = {
    width: NAME_W,
    flexShrink: 0,
    position: 'sticky',
    left: 0,
    zIndex: 1,
    bgcolor: 'background.paper',
    borderRight: '1px solid',
    borderColor: 'divider',
  };

  return (
    <Box sx={{ width: 'fit-content', maxWidth: '100%', mx: 'auto' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, ml: 0.5 }}>
        Dosis en <strong>ml/L</strong> por semana. Se guarda al salir de la celda (o con Enter).
        Arrastrá <DragIndicatorIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom' }} /> para ordenar los pasos del wizard.
      </Typography>

      <Box sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: '100%' }}>
        <Box sx={{ minWidth: NAME_W + totalWeeks * COL_W }}>

          {/* Medición (pH / EC / PPM) */}
          {[
            { field: 'ph', label: 'pH', color: '#2196F3' },
            { field: 'ec', label: 'EC', color: '#00BCD4' },
            { field: 'ppm', label: 'PPM', color: '#FF9800' },
          ].map((p) => (
            <Box key={p.field} sx={{ display: 'flex', borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha(p.color, 0.1) }}>
              <Box sx={{ ...stickyName, display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: p.color }}>{p.label}</Typography>
              </Box>
              {STAGES_DEF.map((st) =>
                Array.from({ length: st.weeks }, (_, i) => i + 1).map((w) => (
                  <PlanCell
                    key={`${p.field}-${st.key}-${w}`}
                    value={plan?.[st.key]?.[w]?.[p.field]}
                    color={p.color}
                    onCommit={(v) => onSetParam(st.key, w, p.field, v)}
                  />
                ))
              )}
            </Box>
          ))}

          {/* Números de semana (divisor entre medición y nutrientes) */}
          <Box sx={{ display: 'flex', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', bgcolor: dividerBg }}>
            <Box sx={{ ...stickyName, bgcolor: dividerBg, display: 'flex', alignItems: 'center', px: 1.5, py: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.primary' }}>
                SEMANAS
              </Typography>
            </Box>
            {STAGES_DEF.map((st) =>
              Array.from({ length: st.weeks }, (_, i) => i + 1).map((w) => (
                <Box key={`${st.key}-${w}`} sx={{ width: COL_W, flexShrink: 0, textAlign: 'center', py: 0.5, borderRight: '1px solid', borderColor: 'divider', bgcolor: alpha(st.color, 0.3) }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#fff' }}>{w}</Typography>
                </Box>
              ))
            )}
          </Box>

          {/* Filas de nutrientes (arrastrables para definir el orden del wizard) */}
          <Reorder.Group
            as="div"
            axis="y"
            values={ordered.map((n) => n.id)}
            onReorder={reorder}
            style={{ margin: 0, padding: 0 }}
          >
            {ordered.map((n) => (
              <NutrientRow
                key={n.id}
                nutrient={n}
                plan={plan}
                stickyName={stickyName}
                onSetNutrient={onSetNutrient}
                onDeleteNutrient={onDeleteNutrient}
              />
            ))}
          </Reorder.Group>
        </Box>
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <Button startIcon={<AddIcon />} onClick={onAddNutrient} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}>
          Agregar nutriente
        </Button>
      </Box>
    </Box>
  );
};

export default CronogramaTable;
