import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, color = 'primary.main' }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'visible',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => 
            theme.palette.mode === 'dark'
              ? '0 12px 24px rgba(0, 0, 0, 0.4)'
              : '0 8px 16px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: { xs: 1, sm: 1.5 }
        }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              letterSpacing: '0.05em',
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color, opacity: 0.8, fontSize: '1.25rem' }}>
              {icon}
            </Box>
          )}
        </Box>
        <Typography
          variant="h3"
          sx={{
            color,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            lineHeight: 1,
            mb: { xs: 0.5, sm: 0.75 },
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;

// Made with Bob
