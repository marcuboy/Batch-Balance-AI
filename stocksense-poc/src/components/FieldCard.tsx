import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import {
  Inventory2,
  Category,
  Warehouse,
  TrendingUp,
  ShoppingCart,
  LocalShipping,
  Schedule,
  Security,
  Business,
  QrCode,
  CalendarMonth,
  AttachMoney,
  Sell,
  Update,
  Label,
} from '@mui/icons-material';

export interface FieldCardProps {
  fieldName: string;
  description: string;
  required?: boolean;
  icon?: string;
}

const iconMap: Record<string, React.ReactElement> = {
  'SKU ID': <QrCode />,
  'Product Name': <Label />,
  'Category': <Category />,
  'Warehouse': <Warehouse />,
  'Current Stock': <Inventory2 />,
  'Opening Stock': <Inventory2 />,
  'Closing Stock': <Inventory2 />,
  'Sales Quantity': <ShoppingCart />,
  'Purchase Quantity': <LocalShipping />,
  'Demand Forecast': <TrendingUp />,
  'Lead Time': <Schedule />,
  'Reorder Point': <Security />,
  'Safety Stock': <Security />,
  'Supplier': <Business />,
  'Batch Number': <QrCode />,
  'Expiry Date': <CalendarMonth />,
  'Unit Cost': <AttachMoney />,
  'Selling Price': <Sell />,
  'Last Updated Date': <Update />,
};

const FieldCard: React.FC<FieldCardProps> = ({ fieldName, description, required = false }) => {
  const icon = iconMap[fieldName] || <Inventory2 />;

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
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
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              flexShrink: 0,
              '& svg': {
                fontSize: 22,
              },
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                fontSize: '0.95rem',
                lineHeight: 1.3,
              }}
            >
              {fieldName}
            </Typography>
            {required && (
              <Chip
                label="Required"
                size="small"
                color="error"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FieldCard;

// Made with Bob
