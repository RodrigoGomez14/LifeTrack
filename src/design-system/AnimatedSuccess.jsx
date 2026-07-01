import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const AnimatedSuccess = ({ color, title, children }) => {
  const theme = useTheme();
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: theme.zIndex.modal + 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Contenedor del circulo */}
      <Box sx={{ position: 'relative', width: 96, height: 96, mb: 3, zIndex: 2 }}>
        {/* Halo de luz */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.05, duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            boxShadow: `0 0 24px ${color}, 0 0 48px ${color}`,
          }}
        />
        {/* Circulo exterior — 1s de pantalla sólida, luego se achica */}
        <motion.div
          initial={{ scale: 40 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 96, height: 96, borderRadius: '50%',
            backgroundColor: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Circulo interior solido */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.15, duration: 0.6, ease: 'easeOut' }}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              backgroundColor: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Check que se dibuja */}
            <svg width="66" height="66" viewBox="0 0 72 72" style={{ overflow: 'visible' }}>
              <motion.path
                d="M18 36 L32 50 L54 28"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.55, duration: 0.45, ease: [0.6, 0, 1, 0.2] }}
                stroke="#ffffff"
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </Box>

      {/* Contenido descubierto por la contracción del círculo */}
      <Box style={{ textAlign: 'center', padding: '0 32px' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
        {children}
      </Box>
    </Box>
  );
};

export default AnimatedSuccess;
