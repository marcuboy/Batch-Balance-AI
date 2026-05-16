import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import IntegrationCard from './IntegrationCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import type { IntegrationCardProps } from './IntegrationCard';
import sapLogo from '../assets/integrations/sap.svg';
import netsuiteLogo from '../assets/integrations/oracle-netsuite.png';
import microsoftDynamicsLogo from '../assets/integrations/microsoft-dynamics.svg';
import zohoInventoryLogo from '../assets/integrations/zoho-inventory.svg';
import manhattanAssociatesLogo from '../assets/integrations/manhattan-associates.png';
import inforLogo from '../assets/integrations/infor.png';
import blueYonderLogo from '../assets/integrations/blue-yonder.png';

const APIIntegrationSection: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const integrations: IntegrationCardProps[] = [
    {
      name: 'SAP',
      initials: 'SAP',
      status: 'API Ready',
      logoSrc: sapLogo,
      description: 'Enterprise ERP and supply chain data connection',
    },
    {
      name: 'Oracle NetSuite',
      initials: 'NS',
      status: 'API Ready',
      logoSrc: netsuiteLogo,
      description: 'Cloud ERP and inventory data sync',
    },
    {
      name: 'Microsoft Dynamics',
      initials: 'MD',
      status: 'API Ready',
      logoSrc: microsoftDynamicsLogo,
      description: 'ERP, finance, and operations integration',
    },
    {
      name: 'Zoho Inventory',
      initials: 'ZI',
      status: 'API Ready',
      logoSrc: zohoInventoryLogo,
      description: 'Inventory and order management sync',
    },
    {
      name: 'Manhattan Associates',
      initials: 'MA',
      status: 'API Ready',
      logoSrc: manhattanAssociatesLogo,
      description: 'Enterprise warehouse management connection',
    },
    {
      name: 'Infor WMS',
      initials: 'IW',
      status: 'API Ready',
      logoSrc: inforLogo,
      description: 'WMS and supply chain execution integration',
    },
    {
      name: 'Blue Yonder',
      initials: 'BY',
      status: 'API Ready',
      logoSrc: blueYonderLogo,
      description: 'Supply chain planning and warehouse intelligence',
    },
    {
      name: 'Custom WMS',
      initials: 'CW',
      status: 'API Ready',
      description: 'Connect internal warehouse systems',
    },
    {
      name: 'Custom ERP',
      initials: 'CE',
      status: 'API Ready',
      description: 'Connect custom business systems through API',
    },
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: 'background.default',
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
            API-Ready WMS & ERP Integrations
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.7,
              mb: 1,
            }}
          >
            Upload files today. Connect directly tomorrow. The system is designed to support
            API-based integrations with enterprise WMS, ERP, and inventory platforms.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {integrations.map((integration) => (
            <IntegrationCard key={integration.name} {...integration} />
          ))}
        </Box>

        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(37, 99, 235, 0.03)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.9rem',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            <strong>Need a custom integration?</strong> We support custom API connections for
            enterprise clients. Contact us to discuss your specific WMS/ERP requirements.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default APIIntegrationSection;

// Made with Bob
