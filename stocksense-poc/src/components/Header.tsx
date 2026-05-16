import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Chip, 
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Download, 
  Save, 
  LightMode, 
  DarkMode 
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { exportToExcel } from '../utils/excelExport';

interface HeaderProps {
  activeTab?: string;
  themeMode?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab = 'overview',
  themeMode = 'dark',
  onToggleTheme
}) => {
  const { parts, mrpDate, filters } = useData();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (parts.length === 0) return;
    
    setExporting(true);
    try {
      exportToExcel(parts, filters.horizon, mrpDate, activeTab);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleSnapshot = () => {
    // Create a snapshot of the current state
    const snapshot = {
      parts,
      filters,
      mrpDate,
      timestamp: new Date().toISOString(),
    };
    
    // Convert to JSON and create a downloadable file
    const dataStr = JSON.stringify(snapshot, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StockSense_Snapshot_${mrpDate}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Also trigger Excel export
    setTimeout(() => handleExport(), 400);
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        backgroundColor: (theme) => themeMode === 'dark'
          ? 'rgba(30, 41, 59, 0.95)'
          : theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <Toolbar 
        sx={{ 
          justifyContent: 'space-between', 
          py: 1.5,
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: { xs: '64px', sm: '70px' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                letterSpacing: '0.02em',
              }}
            >
              StockSense
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Inventory Intelligence Platform
            </Typography>
          </Box>
          {mrpDate && (
            <Chip
              label={`MRP: ${mrpDate}`}
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: '24px', sm: '28px' },
                display: { xs: 'none', sm: 'flex' },
                boxShadow: (theme) => `0 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.25)'}`,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, alignItems: 'center' }}>
          <Tooltip title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton
              onClick={onToggleTheme}
              sx={{
                color: 'text.primary',
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main',
                  transform: 'rotate(180deg)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {themeMode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={!mrpDate || exporting}
            sx={{ 
              borderColor: 'primary.main', 
              color: 'primary.main',
              display: { xs: 'none', md: 'flex' },
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'primary.main',
                color: 'white',
              },
            }}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>

          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSnapshot}
            disabled={!mrpDate}
            sx={{ 
              bgcolor: 'primary.main',
              display: { xs: 'none', sm: 'flex' },
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Snapshot
          </Button>

          {/* Mobile: Icon buttons only */}
          <IconButton
            onClick={handleExport}
            disabled={!mrpDate || exporting}
            sx={{
              display: { xs: 'flex', md: 'none' },
              color: 'primary.main',
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Download />
          </IconButton>

          <IconButton
            onClick={handleSnapshot}
            disabled={!mrpDate}
            sx={{
              display: { xs: 'flex', sm: 'none' },
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            <Save />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

// Made with Bob
