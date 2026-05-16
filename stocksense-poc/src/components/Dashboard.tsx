import React, { useState, useMemo } from 'react';
import { Box, Button, Chip, Container, Paper, Tabs, Tab, Typography } from '@mui/material';
import {
  Star,
  TrendingUp,
  Inventory,
  Warning,
  ViewList,
  SearchOff,
  AutoAwesome,
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import KPICard from './KPICard';
import { calculateKPIs } from '../utils/dummyData';
import FilterDrawer, { FilterButton } from './FilterDrawer';
import AnalysisTab from './AnalysisTab';
import OverstockTab from './OverstockTab';
import UnderstockTab from './UnderstockTab';
import AllPartsTab from './AllPartsTab';
import NotOnMRPTab from './NotOnMRPTab';
import QuickInsights from './QuickInsights';
import InventoryOverviewChart from './InventoryOverviewChart';
import TopIssues from './TopIssues';
import { fmtVol } from '../utils/formatters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: { xs: 2.5, md: 3.5 } }}>{children}</Box>}
    </div>
  );
};

const Dashboard: React.FC<{ onTabChange?: (tab: string) => void }> = ({ onTabChange }) => {
  const { parts, filteredParts, filters } = useData();
  const [activeTab, setActiveTab] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const tabNames = ['overview', 'analysis', 'overstock', 'understock', 'all-parts', 'not-on-mrp'];
  
  // Calculate KPIs using useMemo to avoid unnecessary recalculations
  const kpis = useMemo(() => {
    return calculateKPIs(filteredParts, filters.horizon);
  }, [filteredParts, filters.horizon]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (onTabChange) {
      onTabChange(tabNames[newValue]);
    }
  };

  const handleModuleSelect = (newValue: number) => {
    setActiveTab(newValue);
    onTabChange?.(tabNames[newValue]);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(Math.round(num));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const moduleFilters = [
    { label: 'All', tab: 0, accent: 'primary.main' },
    { label: 'Analysis', tab: 1, accent: 'secondary.main' },
    { label: 'Overstock', tab: 2, accent: 'error.main' },
    { label: 'Understock', tab: 3, accent: 'info.main' },
    { label: 'Inventory', tab: 4, accent: 'success.main' },
    { label: 'MRP gaps', tab: 5, accent: 'warning.main' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 80px)' }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: 'background.paper',
        position: 'sticky',
        top: { xs: 64, sm: 70 },
        zIndex: 100,
        backdropFilter: 'blur(8px)',
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2, md: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              flex: 1,
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 56 },
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 600,
                px: { xs: 1.5, sm: 2.5 },
              },
            }}
          >
            <Tab icon={<Star />} iconPosition="start" label="Overview" />
            <Tab icon={<TrendingUp />} iconPosition="start" label="Analysis" />
            <Tab icon={<Inventory />} iconPosition="start" label="Overstock" />
            <Tab icon={<Warning />} iconPosition="start" label="Understock" />
            <Tab icon={<ViewList />} iconPosition="start" label="All Parts" />
            <Tab icon={<SearchOff />} iconPosition="start" label="Not on MRP" />
          </Tabs>
          <Box sx={{ px: 2 }}>
            <FilterButton isOpen={filtersOpen} onToggle={() => setFiltersOpen(!filtersOpen)} />
          </Box>
        </Container>
      </Box>

      <FilterDrawer isOpen={filtersOpen} />

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Paper
          variant="outlined"
          sx={{
            mt: { xs: 2, md: 3 },
            p: { xs: 1, sm: 1.25 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflowX: 'auto',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(0, 122, 114, 0.18), rgba(49, 87, 213, 0.10))'
                : 'linear-gradient(135deg, rgba(0, 122, 114, 0.08), rgba(49, 87, 213, 0.06))',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, color: 'text.secondary', flex: '0 0 auto' }}>
            <AutoAwesome sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Module</Typography>
          </Box>
          {moduleFilters.map((item) => {
            const selected = activeTab === item.tab;
            return (
              <Button
                key={item.label}
                onClick={() => handleModuleSelect(item.tab)}
                variant={selected ? 'contained' : 'text'}
                size="small"
                sx={{
                  flex: '0 0 auto',
                  px: 1.75,
                  py: 0.9,
                  color: selected ? 'primary.contrastText' : 'text.primary',
                  bgcolor: selected ? item.accent : 'transparent',
                  '&:hover': {
                    bgcolor: selected ? item.accent : 'action.hover',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Paper>

        <TabPanel value={activeTab} index={0}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              mb: { xs: 2.5, md: 3.5 },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.6rem', sm: '1.9rem', md: '2.1rem' },
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                Inventory Health Overview
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Showing {filteredParts.length.toLocaleString('en-GB')} of {parts.length.toLocaleString('en-GB')} parts at a {filters.horizon}-day horizon
              </Typography>
            </Box>
            {filteredParts.length !== parts.length && (
              <Chip
                label="Filtered view"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>

          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              color: 'error.main', 
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              fontWeight: 600,
            }}
          >
            Overstock Analysis
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mb: { xs: 3, md: 4 },
          }}>
            <KPICard
              title="Overstocked Parts"
              value={formatNumber(kpis.overstockedParts)}
              subtitle={`${filters.horizon}-day horizon`}
              color="error.main"
            />
            <KPICard
              title="Total Overstock Qty"
              value={formatNumber(kpis.totalOverstockQty)}
              subtitle="units"
              color="error.main"
            />
            <KPICard
              title="Critical Risk Parts"
              value={formatNumber(kpis.criticalRiskParts)}
              subtitle="need immediate action"
              color="error.main"
            />
            <KPICard
              title="Overstock Value"
              value={formatCurrency(kpis.overstockValue)}
              subtitle="cash tied up"
              color="error.main"
            />
            <KPICard
              title="Overstock Volume"
              value={fmtVol(kpis.overstockVolume)}
              subtitle="warehouse space wasted"
              color="error.main"
            />
          </Box>

          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              color: 'info.main', 
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              fontWeight: 600,
            }}
          >
            Understock Analysis
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mb: { xs: 3, md: 4 },
          }}>
            <KPICard
              title="Understocked Parts"
              value={formatNumber(kpis.understockedParts)}
              subtitle={`${filters.horizon}-day horizon`}
              color="info.main"
            />
            <KPICard
              title="Total Shortage Qty"
              value={formatNumber(kpis.totalShortageQty)}
              subtitle="units needed"
              color="info.main"
            />
            <KPICard
              title="Critical Shortage Parts"
              value={formatNumber(kpis.criticalShortageParts)}
              subtitle="production risk"
              color="info.main"
            />
            <KPICard
              title="Shortage Value at Risk"
              value={formatCurrency(kpis.shortageValue)}
              subtitle="if production stops"
              color="info.main"
            />
            <KPICard
              title="Shortage Volume"
              value={fmtVol(kpis.shortageVolume)}
              subtitle="replenishment space needed"
              color="info.main"
            />
          </Box>

          {/* Quick Insights Section */}
          <QuickInsights />

          {/* Charts and Top Issues Grid */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: { xs: 3, md: 4 },
            mb: { xs: 3, md: 4 },
          }}>
            <InventoryOverviewChart />
            <TopIssues />
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <AnalysisTab />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <OverstockTab />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <UnderstockTab />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <AllPartsTab />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <NotOnMRPTab />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Dashboard;

// Made with Bob
