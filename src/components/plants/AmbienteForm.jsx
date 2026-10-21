import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WizardProgressDots from "./WizardProgressDots";
import WizardFooter from "./WizardFooter";
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from "../../design-system";

const STEPS = 2;

// Wizard de ambiente: paso 1 = nro de ambiente, paso 2 = dimensiones + RDWC.
const AmbienteForm = ({ open, onClose, onSave, editData, plantCount = 0 }) => {
  const theme = useTheme();
  const COLOR = theme.palette.primary.main;

  const [step, setStep] = useState(0);
  const [number, setNumber] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [rdwc, setRdwc] = useState(false);
  const [systemVolume, setSystemVolume] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [snack, setSnack] = useState("");

  // RDWC solo se puede activar o desactivar con el ambiente vacío.
  const isRdwcLocked = plantCount > 0;

  useEffect(() => {
    if (open) {
      setStep(0);
      setNumber(editData?.number || "");
      setDimensions(editData?.dimensions || "");
      setRdwc(!!editData?.rdwc);
      setSystemVolume(editData?.systemVolume ? String(editData.systemVolume) : "");
      setSaving(false);
      setSaved(null);
    }
  }, [open, editData]);

  if (!open) return null;

  const reset = () => {
    setStep(0);
    setNumber("");
    setDimensions("");
    setRdwc(false);
    setSystemVolume("");
    setSaved(null);
    setSaving(false);
  };

  const handleSave = async () => {
    if (!number.trim()) return;
    setSaving(true);
    try {
      const hasRdwc = isRdwcLocked ? !!editData?.rdwc : rdwc;
      const volume = Number(String(systemVolume).replace(",", "."));
      const payload = {
        number: number.trim(),
        dimensions: dimensions.trim(),
        rdwc: hasRdwc,
        systemVolume: hasRdwc && volume > 0 ? volume : null,
        ...(editData?.id ? { id: editData.id } : {}),
      };
      await onSave(payload);
      setSaved(payload);
    } catch {
      setSnack("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const renderSuccess = () => (
    <AnimatedSuccess color={COLOR} title={editData ? "¡Ambiente actualizado!" : "¡Ambiente creado!"}>
      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
        Ambiente {saved.number}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: saved.rdwc ? 0.5 : 3 }}>
        {saved.dimensions || "Sin dimensiones"}
      </Typography>
      {saved.rdwc && (
        <Typography variant="caption" sx={{ fontWeight: 700, color: COLOR, mb: 3, display: "block" }}>
          RDWC{saved.systemVolume ? ` · ${saved.systemVolume} L` : ""}
        </Typography>
      )}
      {!editData && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={reset}
          sx={{
            maxWidth: 320,
            bgcolor: COLOR,
            color: "white",
            borderRadius: 999,
            py: 1.5,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { bgcolor: alpha(COLOR, 0.85) },
          }}
        >
          Crear otro
        </Button>
      )}
      <Button onClick={onClose} sx={{ mt: 1, textTransform: "none", color: "text.secondary" }}>
        Volver a Ambientes
      </Button>
    </AnimatedSuccess>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "background.default",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        zIndex: theme.zIndex.modal,
      }}
    >
      {saved ? (
        renderSuccess()
      ) : (
        <>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            {step > 0 ? (
              <IconButton onClick={() => setStep((s) => Math.max(s - 1, 0))} size="small">
                <ArrowBackIcon />
              </IconButton>
            ) : (
              <Box sx={{ width: 36 }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: "center" }}>
              {editData ? "Editar ambiente" : "Nuevo ambiente"}
            </Typography>
            <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <WizardProgressDots total={STEPS} current={step} color={COLOR} />

          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 3, pb: 3, pt: 2 }}>
            {step === 0 && (
              <AnimatedGroup sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: "text.secondary", ml: 0.5, display: "block" }}>
                    NRO DE AMBIENTE
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  <TextField
                    label="Número o nombre"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    fullWidth
                    required
                    autoFocus
                    placeholder="Ej: 1, 2, Carpa..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 1 && (
              <AnimatedGroup sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: "text.secondary", ml: 0.5, display: "block" }}>
                    DIMENSIONES (OPCIONAL)
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  <TextField
                    label="Dimensiones"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    fullWidth
                    autoFocus
                    placeholder="Ej: 1,2 x 1,2 x 2 m"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </AnimatedItem>

                <AnimatedItem>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${rdwc ? alpha(COLOR, 0.4) : theme.palette.divider}`,
                      bgcolor: rdwc ? alpha(COLOR, 0.04) : "transparent",
                    }}
                  >
                    <FormControlLabel
                      sx={{ m: 0, width: "100%" }}
                      control={
                        <Switch
                          checked={rdwc}
                          onChange={(e) => setRdwc(e.target.checked)}
                          disabled={isRdwcLocked}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Sistema RDWC (4+1)
                        </Typography>
                      }
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      Las plantas de este ambiente comparten la solución y se registran juntas.
                      {isRdwcLocked && " Para activar o desactivar RDWC, el ambiente tiene que estar vacío."}
                    </Typography>

                    {rdwc && (
                      <TextField
                        label="Volumen total del sistema (L)"
                        value={systemVolume}
                        onChange={(e) => setSystemVolume(e.target.value)}
                        fullWidth
                        type="number"
                        inputProps={{ inputMode: "decimal", step: 0.1 }}
                        helperText="Si lo dejás vacío, se usa la suma de las macetas."
                        sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    )}
                  </Box>
                </AnimatedItem>
              </AnimatedGroup>
            )}
          </Box>

          {step === 0 ? (
            <WizardFooter
              label="Siguiente →"
              disabled={!number.trim()}
              onClick={() => setStep(1)}
              color={COLOR}
            />
          ) : (
            <WizardFooter
              label={editData ? "Guardar cambios" : "Crear ambiente"}
              onClick={handleSave}
              loading={saving}
              color={COLOR}
            />
          )}

          <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
            <Alert severity="error" variant="filled" onClose={() => setSnack("")} sx={{ borderRadius: 2 }}>
              {snack}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default AmbienteForm;
