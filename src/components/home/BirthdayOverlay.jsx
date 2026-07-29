import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import confetti from 'canvas-confetti';

const BALLOON_COLORS = [
  { body: '#FF6B9D', highlight: '#FF8FB3' },
  { body: '#45B7D1', highlight: '#6DC5E0' },
  { body: '#96CEB4', highlight: '#B5DFC8' },
  { body: '#FFD93D', highlight: '#FFE680' },
  { body: '#DDA0DD', highlight: '#EBC2EB' },
  { body: '#54A0FF', highlight: '#7DB8FF' },
  { body: '#FF8A5C', highlight: '#FFA880' },
  { body: '#A29BFE', highlight: '#C4BFFE' },
];

const BALLOONS = [
  { left: '4%', offset: 0, duration: 3.5, size: 58, colorIdx: 0 },
  { left: '14%', offset: -1.8, duration: 8.5, size: 48, colorIdx: 1 },
  { left: '25%', offset: -0.6, duration: 4.2, size: 62, colorIdx: 2 },
  { left: '36%', offset: -2.5, duration: 9.5, size: 44, colorIdx: 3 },
  { left: '48%', offset: -1.0, duration: 5.0, size: 56, colorIdx: 4 },
  { left: '59%', offset: -3.0, duration: 7.0, size: 50, colorIdx: 5 },
  { left: '71%', offset: -0.3, duration: 6.0, size: 60, colorIdx: 6 },
  { left: '83%', offset: -2.0, duration: 4.8, size: 46, colorIdx: 7 },
  { left: '93%', offset: -1.2, duration: 9.0, size: 52, colorIdx: 0 },
];

const BirthdayOverlay = ({ onDismiss }) => {
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef(null);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(handleDismiss, 10000);
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const myConfetti = confetti.create(canvas, { resize: true });
    const colors = BALLOON_COLORS.map(c => c.body);

    const fire = () => myConfetti({
      particleCount: 80 + Math.floor(Math.random() * 120),
      spread: 100 + Math.floor(Math.random() * 80),
      origin: {
        y: 0.2 + Math.random() * 0.5,
        x: Math.random() > 0.5 ? 0.15 : 0.85,
      },
      colors,
      startVelocity: 25 + Math.floor(Math.random() * 30),
    });

    // Ráfaga triple inicial
    fire();
    setTimeout(fire, 150);
    setTimeout(fire, 350);

    const interval = setInterval(fire, 800 + Math.random() * 600);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>
        {`
          @keyframes bdayFall {
            0%   { transform: translateY(-300px) rotate(-6deg); opacity: 0; }
            8%   { opacity: 1; }
            85%  { opacity: 1; }
            100% { transform: translateY(105vh) rotate(6deg); opacity: 0; }
          }
          @keyframes bdaySway {
            0%, 100% { transform: rotate(-5deg); }
            50%      { transform: rotate(5deg); }
          }
          @keyframes bdayStringFall {
            0%   { transform: translateY(0) rotate(-4deg); }
            50%  { transform: translateY(3px) rotate(4deg); }
            100% { transform: translateY(0) rotate(-4deg); }
          }
          @keyframes bdayFadeIn {
            0%   { opacity: 0; }
            100% { opacity: 1; }
          }
        `}
      </style>

      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 9998,
        }}
      />

      <Box
        onClick={handleDismiss}
        sx={{
          position: 'fixed', inset: 0, zIndex: 9997,
          pointerEvents: 'auto', cursor: 'pointer',
          animation: 'bdayFadeIn 0.6s ease-out',
          bgcolor: 'rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Balloons */}
        {BALLOONS.map((b, i) => {
          const c = BALLOON_COLORS[b.colorIdx];
          const swingDir = i % 2 === 0 ? -1 : 1;
          return (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                top: 0,
                left: b.left,
                animation: `bdayFall ${b.duration}s ease-in-out ${b.offset}s infinite`,
                transformOrigin: 'center bottom',
              }}
            >
              <Box
                sx={{
                  width: b.size,
                  height: b.size * 1.1,
                  borderRadius: `${b.size * 0.5}px ${b.size * 0.5}px ${b.size * 0.4}px ${b.size * 0.4}px`,
                  background: `radial-gradient(ellipse at 35% 30%, ${c.highlight}, ${c.body})`,
                  position: 'relative',
                  animation: `bdaySway ${2 + (i % 4) * 0.6}s ease-in-out ${b.offset + 0.3 * swingDir}s infinite`,
                  boxShadow: `inset -5px -5px 14px rgba(0,0,0,0.08), inset 5px 5px 14px rgba(255,255,255,0.3)`,
                  mx: 'auto',
                }}
              >
                {/* Highlight shine */}
                <Box
                  sx={{
                    position: 'absolute', top: '14%', left: '24%',
                    width: '32%', height: '20%',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.45)',
                    transform: 'rotate(-30deg)',
                  }}
                />
                {/* Knot */}
                <Box
                  sx={{
                    position: 'absolute', bottom: -8, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `8px solid ${c.body}`,
                  }}
                />
              </Box>
              {/* String */}
              <Box
                sx={{
                  width: 1.5,
                  height: { xs: 45, sm: 60 },
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  mx: 'auto',
                  animation: `bdayStringFall ${1.5 + (i % 3) * 0.4}s ease-in-out ${b.offset + 0.5}s infinite`,
                  transformOrigin: 'top center',
                }}
              />
            </Box>
          );
        })}

        {/* Close button */}
        <IconButton
          onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
          sx={{
            position: 'absolute', top: 12, right: 12,
            bgcolor: 'rgba(0,0,0,0.06)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.12)' },
            pointerEvents: 'auto',
          }}
        >
          <CloseIcon sx={{ fontSize: 20, color: 'rgba(0,0,0,0.5)' }} />
        </IconButton>
      </Box>
    </>
  );
};

export default BirthdayOverlay;
