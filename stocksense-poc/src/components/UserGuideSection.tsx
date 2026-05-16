import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import {
  FileDownload,
  CompareArrows,
  Description,
  CloudUpload,
  Analytics,
} from '@mui/icons-material';
import GuideStep from './GuideStep';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const UserGuideSection: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const steps = [
    {
      title: 'Export Your Data',
      description: 'Export your inventory data from your WMS, ERP, or Excel system in CSV or Excel format.',
      icon: <FileDownload />,
    },
    {
      title: 'Match Your Columns',
      description: 'Ensure your file columns match the required fields or use our mapping tool.',
      icon: <CompareArrows />,
    },
    {
      title: 'Use Sample Template',
      description: 'Download and use our template if your file format is different from standard exports.',
      icon: <Description />,
    },
    {
      title: 'Upload Your File',
      description: 'Drag and drop your file or click to browse. We support CSV, XLS, and XLSX formats.',
      icon: <CloudUpload />,
    },
    {
      title: 'Review Insights',
      description: 'Get instant analysis on overstock, understock, demand forecasts, and reorder recommendations.',
      icon: <Analytics />,
    },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.03)' : 'rgba(37, 99, 235, 0.02)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 2,
            }}
          >
            How to Prepare Your File
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.7,
            }}
          >
            Follow these simple steps to get your inventory data ready for analysis.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: { xs: 2.5, md: 3 },
            mb: { xs: 4, md: 5 },
          }}
        >
          {steps.map((step, index) => (
            <GuideStep
              key={index}
              stepNumber={index + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default UserGuideSection;

// Made with Bob
