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
  DarkMode,
  Inventory2,
  UploadFile,
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { exportToExcel } from '../utils/excelExport';

interface HeaderProps {
  activeTab?: string;
  themeMode?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onReset?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab = 'overview',
  themeMode = 'dark',
  onToggleTheme,
  onReset,
}) => {
  const { parts, filteredParts, mrpDate, filters, resetData } = useData();
  const [exporting, setExporting] = useState(false);
  const hasData = parts.length > 0;

  const handleExport = async () => {
    if (parts.length === 0) return;
    
    setExporting(true);
    try {
      exportToExcel(filteredParts, filters.horizon, mrpDate, activeTab);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleSnapshot = () => {
    if (!hasData) return;

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
  };

  const handleReset = () => {
    resetData();
    onReset?.();
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.75 }, minWidth: 0 }}>
          <Box
            sx={{
              width: { xs: 38, sm: 42 },
              height: { xs: 38, sm: 42 },
              borderRadius: 2,
              display: { xs: 'none', sm: 'grid' },
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: (theme) => `0 10px 24px ${theme.palette.mode === 'dark' ? 'rgba(0, 151, 136, 0.28)' : 'rgba(0, 104, 95, 0.22)'}`,
            }}
            aria-hidden="true"
          >
            <Inventory2 fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.45rem', sm: '1.75rem', md: '2rem' },
                letterSpacing: 0,
                whiteSpace: 'nowrap',
              }}
            >
              StockSense
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                letterSpacing: 0,
                textTransform: 'uppercase',
                fontWeight: 600,
                display: 'block',
                maxWidth: { xs: 150, sm: 'none' },
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
              aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
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
            disabled={!hasData || exporting}
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
            disabled={!hasData}
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

          {hasData && (
            <Button
              variant="outlined"
              startIcon={<UploadFile />}
              onClick={handleReset}
              sx={{
                display: { xs: 'none', lg: 'flex' },
                borderColor: 'divider',
                color: 'text.primary',
              }}
            >
              New files
            </Button>
          )}

          {/* Mobile: Icon buttons only */}
          <Tooltip title="Export">
            <span>
              <IconButton
                aria-label="Export"
                onClick={handleExport}
                disabled={!hasData || exporting}
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
            </span>
          </Tooltip>

          <Tooltip title="Save snapshot">
            <span>
              <IconButton
                aria-label="Save snapshot"
                onClick={handleSnapshot}
                disabled={!hasData}
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  bgcolor: hasData ? 'primary.main' : 'action.disabledBackground',
                  color: hasData ? 'white' : 'action.disabled',
                }}
              >
                <Save />
              </IconButton>
            </span>
          </Tooltip>

          {hasData && (
            <Tooltip title="Load new files">
              <IconButton
                aria-label="Load new files"
                onClick={handleReset}
                sx={{
                  display: { xs: 'flex', lg: 'none' },
                  color: 'text.primary',
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <UploadFile />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

// Made with Bob
