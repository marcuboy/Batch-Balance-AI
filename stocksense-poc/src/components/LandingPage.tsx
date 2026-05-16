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
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  PlayArrow,
  CheckCircle,
  Download,
  HelpOutlined,
  InsertDriveFile,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useData } from '../context/DataContext';
import { readExcelFile, processFiles } from '../utils/fileProcessor';
import {
  downloadTemplate,
  getTemplate,
  validateTemplateHeaders,
  type TemplateKey,
} from '../utils/templateGenerator';
import UserGuideSection from './UserGuideSection';
import APIIntegrationSection from './APIIntegrationSection';
import type { ERPSystem } from '../types';

interface LandingPageProps {
  onAnalyze: () => void;
}

interface UploadedFiles {
  mrp: File | null;
  stock: File | null;
  packaging: File | null;
  dimensions: File | null;
  prices: File | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze }) => {
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
  const [showUploadSection, setShowUploadSection] = useState(false);

  const handleLoadDemo = () => {
    loadDemoData();
    onAnalyze();
  };

  const handleERPChange = (value: string) => {
    setErpSystem(value as ERPSystem);
  };

  const revealUploadSection = () => {
    setShowUploadSection(true);
    window.setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleFileUpload = useCallback(
    (fileType: TemplateKey) => async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const data = await readExcelFile(file);
        const validation = validateTemplateHeaders(fileType, data[0] || []);

        if (!validation.valid) {
          setFiles((prev) => ({ ...prev, [fileType]: null }));
          setError(validation.message || `${getTemplate(fileType).title} file has an invalid header format.`);
          return;
        }

        setFiles((prev) => ({ ...prev, [fileType]: file }));
        setError('');
      } catch (err) {
        setFiles((prev) => ({ ...prev, [fileType]: null }));
        setError(err instanceof Error ? err.message : `Could not read the ${getTemplate(fileType).title} file.`);
      }
    },
    []
  );

  const handleRejectedUpload = useCallback((fileType: TemplateKey) => {
    setFiles((prev) => ({ ...prev, [fileType]: null }));
    setError(
      `${getTemplate(fileType).title} upload failed. Use the downloadable template and upload a CSV, XLS, or XLSX file.`
    );
  }, []);

  const handleAnalyze = async () => {
    if (!files.mrp || !files.stock) {
      setError('MRP and Stock files are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mrpData = await readExcelFile(files.mrp);
      const stockData = await readExcelFile(files.stock);
      const packagingData = files.packaging ? await readExcelFile(files.packaging) : undefined;
      const dimensionsData = files.dimensions ? await readExcelFile(files.dimensions) : undefined;
      const pricesData = files.prices ? await readExcelFile(files.prices) : undefined;

      const { parts, mrpDate } = await processFiles(
        {
          mrp: mrpData,
          stock: stockData,
          packaging: packagingData,
          dimensions: dimensionsData,
          prices: pricesData,
        },
        erpSystem
      );

      setParts(parts);
      setMrpDate(mrpDate);
      onAnalyze();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = files.mrp && files.stock && !loading;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
                : 'radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 6 },
              alignItems: 'center',
            }}
          >
            {/* Left: Hero Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 2,
                }}
              >
                Know Your Inventory.{' '}
                <Box
                  component="span"
                  sx={{
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Fix It Faster.
                </Box>
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                Upload WMS/ERP inventory files, map fields automatically, analyze overstock and
                understock, and generate actionable insights in seconds.
              </Typography>

              {/* CTA Buttons */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CloudUpload />}
                  onClick={revealUploadSection}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: (theme) =>
                      `0 4px 14px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.3)'}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: (theme) =>
                        `0 6px 20px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.4)'}`,
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Upload File
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Download />}
                  onClick={revealUploadSection}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  View Templates
                </Button>
                <Button
                  variant="text"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={handleLoadDemo}
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  Try Demo
                </Button>
              </Box>

              {/* Quick Stats */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {'<5s'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Analysis Time
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    19+
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Data Fields
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    9+
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ERP Systems
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right: Dashboard Preview */}
            <Box
              sx={{
                position: 'relative',
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
                      : '0 20px 60px rgba(0, 0, 0, 0.15)',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Inventory Health Dashboard
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'success.main',
                      color: 'success.contrastText',
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Healthy Stock
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      67%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'warning.main',
                      color: 'warning.contrastText',
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Overstock
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      18%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Understock
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      15%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Upload Section (Collapsible) */}
      {showUploadSection && (
        <Box
          id="upload-section"
          sx={{
            py: { xs: 4, md: 6 },
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.03)' : 'rgba(37, 99, 235, 0.02)',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Upload Your Inventory Data
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Download each template, replace the sample rows, then upload the matching CSV, XLS, or XLSX file for instant analysis.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <FormControl fullWidth sx={{ maxWidth: 500, mx: 'auto' }}>
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                <FileDropZone
                  label="MRP Demand File"
                  required
                  templateKey="mrp"
                  file={files.mrp}
                  onDrop={handleFileUpload('mrp')}
                  onDropRejected={() => handleRejectedUpload('mrp')}
                />
                <FileDropZone
                  label="Stock on Hand File"
                  required
                  templateKey="stock"
                  file={files.stock}
                  onDrop={handleFileUpload('stock')}
                  onDropRejected={() => handleRejectedUpload('stock')}
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                  gap: 3,
                }}
              >
                <FileDropZone
                  label="Packaging File"
                  templateKey="packaging"
                  file={files.packaging}
                  onDrop={handleFileUpload('packaging')}
                  onDropRejected={() => handleRejectedUpload('packaging')}
                  optional
                />
                <FileDropZone
                  label="Dimensions File"
                  templateKey="dimensions"
                  file={files.dimensions}
                  onDrop={handleFileUpload('dimensions')}
                  onDropRejected={() => handleRejectedUpload('dimensions')}
                  optional
                />
                <FileDropZone
                  label="Prices File"
                  templateKey="prices"
                  file={files.prices}
                  onDrop={handleFileUpload('prices')}
                  onDropRejected={() => handleRejectedUpload('prices')}
                  optional
                />
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                sx={{
                  px: 5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: (theme) =>
                    canAnalyze
                      ? `0 4px 14px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.3)'}`
                      : 'none',
                  '&:hover': canAnalyze
                    ? {
                        transform: 'translateY(-2px)',
                        boxShadow: (theme) =>
                          `0 6px 20px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.4)'}`,
                      }
                    : {},
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Analyze Now'}
              </Button>
              <Button
                variant="text"
                size="large"
                startIcon={<HelpOutlined />}
                onClick={() => {
                  document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Need Help?
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                Accepted formats: CSV, XLS, XLSX • Max file size: 10MB per file
              </Typography>
            </Box>
          </Container>
        </Box>
      )}

      {/* User Guide Section */}
      <Box id="guide-section">
        <UserGuideSection />
      </Box>

      {/* API Integration Section */}
      <APIIntegrationSection />
    </Box>
  );
};

interface FileDropZoneProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  templateKey: TemplateKey;
  file: File | null;
  onDrop: (files: File[]) => void | Promise<void>;
  onDropRejected: () => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileDropZone: React.FC<FileDropZoneProps> = ({
  label,
  required,
  optional,
  templateKey,
  file,
  onDrop,
  onDropRejected,
}) => {
  const template = getTemplate(templateKey);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const isLoaded = !!file;

  return (
    <Card
      {...getRootProps()}
        sx={{
          height: '100%',
          minHeight: 240,
          border: '2px dashed',
          borderColor: isLoaded ? 'success.main' : isDragActive ? 'primary.main' : 'divider',
        bgcolor: isLoaded
          ? 'rgba(16, 185, 129, 0.08)'
          : isDragActive
          ? 'rgba(59, 130, 246, 0.08)'
          : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
          '&:hover': {
            borderColor: isLoaded ? 'success.light' : 'primary.main',
            transform: 'translateY(-3px)',
            boxShadow: (theme) =>
              isLoaded
                ? `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.2)'}`
              : `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.2)'}`,
        },
      }}
    >
      <CardContent
        sx={{
          textAlign: 'center',
          py: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.25,
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
            {isLoaded ? (
              <>
                <CheckCircle sx={{ fontSize: 44, color: 'success.main' }} />
                <InsertDriveFile sx={{ fontSize: 28, color: 'success.main' }} />
              </>
            ) : (
              <CloudUpload
                sx={{
                  fontSize: 44,
                  color: optional ? 'text.secondary' : 'primary.main',
                }}
              />
            )}
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
              {label}
            </Typography>
            {required && <Chip label="Required" size="small" color="error" sx={{ fontWeight: 600 }} />}
            {optional && <Chip label="Optional" size="small" sx={{ fontWeight: 600 }} />}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
            {template.description}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35, maxWidth: 320 }}>
            {template.formatNote} Download, fill, then upload as CSV, XLS, or XLSX.
          </Typography>

          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
            <Button
              type="button"
              size="small"
              variant="outlined"
              startIcon={<Download />}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                downloadTemplate(templateKey);
              }}
              sx={{ fontWeight: 700 }}
            >
              {template.downloadLabel}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', maxWidth: 260 }}>
              {isLoaded ? file.name : 'Drop file here or click to browse'}
            </Typography>
            {isLoaded && (
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(file.size)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
};

export default LandingPage;

// Made with Bob
