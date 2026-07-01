import React, { forwardRef, useMemo, createContext, useContext } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const SkipEnterCtx = createContext(false);

export const AnimatedGroup = forwardRef(({
  children,
  staggerDelay = 0.05,
  delay = 0.05,
  skipEnter = false,
  sx,
  ...props
}, ref) => {
  const parentSkip = useContext(SkipEnterCtx);
  const effectiveSkip = skipEnter || parentSkip;

  const variants = useMemo(() => {
    if (effectiveSkip) {
      return { hidden: { opacity: 1 }, show: { opacity: 1 } };
    }
    return {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: staggerDelay, delayChildren: delay },
      },
    };
  }, [effectiveSkip, staggerDelay, delay]);

  const content = (
    <Box
      ref={ref}
      component={motion.div}
      variants={variants}
      initial="hidden"
      animate="show"
      sx={sx}
      {...props}
    >
      {children}
    </Box>
  );

  if (skipEnter) {
    return <SkipEnterCtx.Provider value={true}>{content}</SkipEnterCtx.Provider>;
  }
  return content;
});

AnimatedGroup.displayName = 'AnimatedGroup';

export const AnimatedItem = forwardRef(({ children, sx, ...props }, ref) => {
  const skipEnter = useContext(SkipEnterCtx);

  const variants = skipEnter
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
      };

  return (
    <Box
      ref={ref}
      component={motion.div}
      variants={variants}
      sx={sx}
      {...props}
    >
      {children}
    </Box>
  );
});

AnimatedItem.displayName = 'AnimatedItem';
