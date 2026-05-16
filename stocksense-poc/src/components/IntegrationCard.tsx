import React, { useState } from 'react';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';

export interface IntegrationCardProps {
  name: string;
  description: string;
  initials: string;
  status: 'API Ready' | 'Coming Soon';
  logoSrc?: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  description,
  initials,
  status,
  logoSrc,
}) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(logoSrc && !logoFailed);
  const isReady = status === 'API Ready';
  const logoWidth = showLogo ? 118 : 52;

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: 2.5,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 18px 44px rgba(0, 151, 136, 0.18)'
              : '0 18px 44px rgba(15, 35, 31, 0.10)',
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.25, md: 2.75 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          minHeight: 188,
          gap: 2,
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start' }}>
          <Box
            role="img"
            aria-label={`${name} logo`}
            sx={{
              width: logoWidth,
              maxWidth: '100%',
              height: 52,
              borderRadius: 2,
              flex: `0 0 ${logoWidth}px`,
              overflow: 'hidden',
              bgcolor: showLogo ? '#fff' : 'background.default',
              border: '1px solid',
              borderColor: showLogo ? 'rgba(15, 35, 31, 0.12)' : 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.contrastText',
              fontWeight: 900,
              letterSpacing: 0,
              background: showLogo ? '#fff' : 'linear-gradient(135deg, #007A72 0%, #3157D5 100%)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'inset 0 1px 0 rgba(255,255,255,0.08)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            {showLogo ? (
              <Box
                component="img"
                src={logoSrc}
                alt={`${name} logo`}
                loading="lazy"
                onError={() => setLogoFailed(true)}
                sx={{ width: '100%', height: '100%', objectFit: 'contain', p: showLogo ? 1.25 : 1 }}
              />
            ) : (
              initials
            )}
          </Box>

          <Chip
            label={status}
            size="small"
            sx={{
              height: 24,
              fontWeight: 800,
              fontSize: '0.7rem',
              color: isReady ? 'success.dark' : 'warning.dark',
              bgcolor: isReady ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.14)',
              border: '1px solid',
              borderColor: isReady ? 'rgba(16, 185, 129, 0.34)' : 'rgba(245, 158, 11, 0.36)',
            }}
          />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.02rem',
              mb: 0.75,
              lineHeight: 1.2,
            }}
          >
            {name}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.88rem',
              lineHeight: 1.55,
            }}
          >
            {description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;

// Made with Bob
