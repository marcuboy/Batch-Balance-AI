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
  UploadFile,
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { exportToExcel } from '../utils/excelExport';
import stockSenseIcon from '../assets/brand/stocksense-icon.png';

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

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const createHtmlSnapshot = () => {
    const root = document.getElementById('root');
    if (!root) {
      throw new Error('Could not find the dashboard root to snapshot.');
    }

    const clone = root.cloneNode(true) as HTMLElement;
    const originalCanvases = Array.from(root.querySelectorAll('canvas'));
    const clonedCanvases = Array.from(clone.querySelectorAll('canvas'));

    clonedCanvases.forEach((canvas, index) => {
      const source = originalCanvases[index];
      if (!source) return;

      try {
        const image = document.createElement('img');
        image.src = source.toDataURL('image/png');
        image.alt = source.getAttribute('aria-label') || 'StockSense chart snapshot';
        image.style.width = `${source.getBoundingClientRect().width}px`;
        image.style.maxWidth = '100%';
        image.style.height = 'auto';
        image.style.display = 'block';
        canvas.replaceWith(image);
      } catch {
        // Keep the canvas if the browser cannot export it.
      }
    });

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => {
        if (node instanceof HTMLLinkElement) {
          return `<link rel="stylesheet" href="${escapeHtml(node.href)}">`;
        }
        return node.outerHTML;
      })
      .join('\n');

    const capturedAt = new Date().toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const title = `StockSense Snapshot - ${activeTab} - ${mrpDate || 'no-mrp-date'}`;

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  ${styles}
  <style>
    body { margin: 0; background: ${themeMode === 'dark' ? '#0B1512' : '#F6FAF8'}; }
    .stocksense-snapshot-banner {
      box-sizing: border-box;
      padding: 14px 24px;
      font: 600 13px/1.4 Inter, Roboto, Arial, sans-serif;
      color: ${themeMode === 'dark' ? '#D7ECE8' : '#31534D'};
      background: ${themeMode === 'dark' ? '#10221E' : '#EAF4F1'};
      border-bottom: 1px solid ${themeMode === 'dark' ? '#264B45' : '#D4E4DF'};
    }
    .stocksense-snapshot-banner strong { color: ${themeMode === 'dark' ? '#FFFFFF' : '#15231F'}; }
    button, [role="button"], input, select, textarea { pointer-events: none !important; }
    canvas, img { max-width: 100%; }
    @media print {
      .stocksense-snapshot-banner { position: static; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="stocksense-snapshot-banner">
    <strong>StockSense HTML Snapshot</strong> · ${escapeHtml(activeTab)} · MRP ${escapeHtml(mrpDate || 'n/a')} · Captured ${escapeHtml(capturedAt)}
  </div>
  ${clone.outerHTML}
</body>
</html>`;
  };

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

    const html = createHtmlSnapshot();
    const dataBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StockSense_Snapshot_${activeTab}_${mrpDate}_${new Date().toISOString().split('T')[0]}.html`;
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
            component="img"
            src={stockSenseIcon}
            alt="StockSense logo"
            sx={{
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              borderRadius: 2,
              display: 'block',
              objectFit: 'cover',
              bgcolor: 'common.white',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) => `0 10px 24px ${theme.palette.mode === 'dark' ? 'rgba(0, 151, 136, 0.28)' : 'rgba(0, 104, 95, 0.22)'}`,
            }}
          />
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
