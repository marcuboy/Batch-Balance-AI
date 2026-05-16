import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export interface GuideStepProps {
  stepNumber: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const GuideStep: React.FC<GuideStepProps> = ({ stepNumber, title, description, icon }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(59, 130, 246, 0.15)'
              : '0 8px 24px rgba(37, 99, 235, 0.12)',
          borderColor: 'primary.main',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.25rem',
            flexShrink: 0,
          }}
        >
          {stepNumber}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: '1.1rem',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        </Box>
        {icon && (
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              '& svg': {
                fontSize: 32,
              },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default GuideStep;

// Made with Bob
