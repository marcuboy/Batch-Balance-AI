import type { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number | { xs: number; md: number };
  action?: ReactNode;
}

export default function ChartCard({ title, subtitle, children, height = { xs: 300, md: 340 }, action }: ChartCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(0, 163, 154, 0.08), transparent 42%)'
              : 'linear-gradient(135deg, rgba(0, 122, 114, 0.06), transparent 45%)',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.86rem' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
        <Box sx={{ height }}>{children}</Box>
      </Box>
    </Paper>
  );
}

// Made with Bob
