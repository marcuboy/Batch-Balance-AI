import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload, PlayArrow, CheckCircle } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useData } from '../context/DataContext';
import { readExcelFile, processFiles } from '../utils/fileProcessor';
import type { ERPSystem } from '../types';

interface UploadScreenProps {
  onAnalyze: () => void;
}

interface UploadedFiles {
  mrp: File | null;
  stock: File | null;
  packaging: File | null;
  dimensions: File | null;
  prices: File | null;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onAnalyze }) => {
  const { erpSystem, setErpSystem, loadDemoData, setParts, setMrpDate } = useData();
  const [files, setFiles] = useState<UploadedFiles>({
    mrp: null,
    stock: null,
    packaging: null,
    dimensions: null,
    prices: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleLoadDemo = () => {
    loadDemoData();
    onAnalyze();
  };

  const handleERPChange = (value: string) => {
    setErpSystem(value as ERPSystem);
  };

  const handleFileUpload = useCallback((fileType: keyof UploadedFiles) => (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(prev => ({ ...prev, [fileType]: acceptedFiles[0] }));
      setError('');
    }
  }, []);

  const handleAnalyze = async () => {
    if (!files.mrp || !files.stock) {
      setError('MRP and Stock files are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Read all files
      const mrpData = await readExcelFile(files.mrp);
      const stockData = await readExcelFile(files.stock);
      const packagingData = files.packaging ? await readExcelFile(files.packaging) : undefined;
      const dimensionsData = files.dimensions ? await readExcelFile(files.dimensions) : undefined;
      const pricesData = files.prices ? await readExcelFile(files.prices) : undefined;

      // Process files
      const { parts, mrpDate } = await processFiles({
        mrp: mrpData,
        stock: stockData,
        packaging: packagingData,
        dimensions: dimensionsData,
        prices: pricesData,
      }, erpSystem);

      // Update context
      setParts(parts);
      setMrpDate(mrpDate);

      // Navigate to dashboard
      onAnalyze();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = files.mrp && files.stock && !loading;

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5, md: 6 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: 2,
              letterSpacing: 0,
              lineHeight: 1.2,
            }}
          >
            Know Your Inventory.{' '}
            <Box
              component="span"
              sx={{
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Fix It Faster.
            </Box>
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 3, sm: 4 }, 
              maxWidth: 600, 
              mx: 'auto',
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
            }}
          >
            Automated inventory health analysis in seconds
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleLoadDemo}
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
              fontWeight: 700,
              boxShadow: (theme) => `0 4px 14px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.3)'}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 6px 20px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.4)'}`,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Load Demo Data
          </Button>
        </Box>

        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <FormControl 
            fullWidth 
            sx={{ 
              maxWidth: 500, 
              mx: 'auto',
            }}
          >
            <InputLabel>ERP / WMS System</InputLabel>
            <Select
              value={erpSystem}
              label="ERP / WMS System"
              onChange={(e) => handleERPChange(e.target.value)}
              sx={{ 
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                },
              }}
            >
            <MenuItem value="standard">Standard / Custom</MenuItem>
            <MenuItem value="sap">SAP MM / EWM</MenuItem>
            <MenuItem value="oracle">Oracle SCM</MenuItem>
            <MenuItem value="dynamics">Dynamics 365</MenuItem>
            <MenuItem value="infor">Infor WMS</MenuItem>
            <MenuItem value="manhattan">Manhattan Associates</MenuItem>
            <MenuItem value="other">Other / Custom mapping</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 720, mx: 'auto' }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: { xs: 2, sm: 3 },
          }}>
            <FileDropZone
              label="MRP Demand File"
              required
              file={files.mrp}
              onDrop={handleFileUpload('mrp')}
            />
            <FileDropZone
              label="Stock on Hand File"
              required
              file={files.stock}
              onDrop={handleFileUpload('stock')}
            />
          </Box>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: { xs: 2, sm: 3 },
          }}>
            <FileDropZone
              label="Packaging File"
              file={files.packaging}
              onDrop={handleFileUpload('packaging')}
              optional
            />
            <FileDropZone
              label="Dimensions File"
              file={files.dimensions}
              onDrop={handleFileUpload('dimensions')}
              optional
            />
            <FileDropZone
              label="Prices File"
              file={files.prices}
              onDrop={handleFileUpload('prices')}
              optional
            />
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: { xs: 3, sm: 4 } }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            sx={{
              px: { xs: 4, sm: 5 },
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.95rem', sm: '1rem' },
              fontWeight: 700,
              boxShadow: (theme) => canAnalyze ? `0 4px 14px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.3)'}` : 'none',
              '&:hover': canAnalyze ? {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 6px 20px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.4)'}`,
              } : {},
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Analyse'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 3 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
            Drop your Excel files above or click "Load Demo Data" for instant analysis
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

interface FileDropZoneProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  file: File | null;
  onDrop: (files: File[]) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ label, required, optional, file, onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const isLoaded = !!file;
  const isOptional = optional;

  return (
    <Card
      {...getRootProps()}
      sx={{
        height: '100%',
        minHeight: { xs: 140, sm: 160 },
        border: '2px dashed',
        borderColor: isLoaded ? 'success.main' : isDragActive ? 'primary.main' : 'divider',
        bgcolor: isLoaded 
          ? 'success.main' 
          : isDragActive 
          ? 'primary.main' 
          : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        opacity: isOptional ? 0.85 : 1,
        '&:hover': {
          borderColor: isLoaded ? 'success.light' : 'primary.main',
          bgcolor: (theme) => isLoaded
            ? theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.08)'
            : theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.08)',
          transform: 'translateY(-4px)',
          boxShadow: (theme) => isLoaded
            ? `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.2)'}`
            : `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.2)'}`,
        },
        ...(isLoaded && {
          bgcolor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'success.main',
        }),
        ...(isDragActive && {
          bgcolor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'primary.main',
        }),
      }}
    >
      <CardContent sx={{ 
        textAlign: 'center', 
        py: { xs: 2.5, sm: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <input {...getInputProps()} />
        {isLoaded ? (
          <CheckCircle sx={{ 
            fontSize: { xs: 40, sm: 48 }, 
            color: 'success.main', 
            mb: { xs: 1, sm: 1.5 } 
          }} />
        ) : (
          <CloudUpload sx={{ 
            fontSize: { xs: 40, sm: 48 }, 
            color: isOptional ? 'text.secondary' : 'primary.main', 
            mb: { xs: 1, sm: 1.5 } 
          }} />
        )}
        <Typography 
          variant={isOptional ? 'body1' : 'h6'} 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: isOptional ? '0.9rem' : '1rem', sm: isOptional ? '1rem' : '1.125rem' },
          }}
        >
          {label}
        </Typography>
        <Typography 
          variant={isOptional ? 'caption' : 'body2'} 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
        >
          {required ? 'Required • Excel format' : optional ? 'Optional' : 'Excel format'}
        </Typography>
        {isLoaded && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              color: 'success.main',
              fontWeight: 600,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              wordBreak: 'break-all',
              px: 1,
            }}
          >
            {file.name}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadScreen;

// Made with Bob
