import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { useData } from '../context/DataContext';

interface FilterDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function FilterButton({ onToggle }: FilterDrawerProps) {
  const { filters } = useData();

  // Count active filters
  const activeFilterCount = [
    filters.site !== 'both',
    filters.vendor !== 'all',
    filters.risk !== 'all',
    filters.shortageRisk !== 'all',
    filters.analyst !== 'all',
    filters.partSearch,
    filters.atb !== null,
    filters.obs !== null,
    filters.tls !== null,
    filters.packGroup !== 'all',
  ].filter(Boolean).length;

  return (
    <Button
      onClick={onToggle}
      startIcon={<FilterList />}
      variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
      size="small"
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        px: 2,
        py: 0.75,
        minWidth: 'auto',
      }}
    >
      Filters
      {activeFilterCount > 0 && (
        <Chip
          label={activeFilterCount}
          size="small"
          sx={{
            ml: 1,
            height: '18px',
            fontSize: '0.7rem',
            fontWeight: 700,
            bgcolor: 'background.paper',
            color: 'primary.main',
          }}
        />
      )}
    </Button>
  );
}

export default function FilterDrawer({ isOpen }: { isOpen: boolean }) {
  const { parts, filters, setFilters } = useData();

  // Get unique values for dropdowns
  const vendors = Array.from(new Set(parts.map(p => p.vname))).sort();
  const analysts = Array.from(new Set(parts.map(p => p.analyst).filter(Boolean))).sort();

  // Count active filters
  const activeFilterCount = [
    filters.site !== 'both',
    filters.vendor !== 'all',
    filters.risk !== 'all',
    filters.shortageRisk !== 'all',
    filters.analyst !== 'all',
    filters.partSearch,
    filters.atb !== null,
    filters.obs !== null,
    filters.tls !== null,
    filters.packGroup !== 'all',
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setFilters({
      ...filters,
      site: 'both',
      vendor: 'all',
      risk: 'all',
      shortageRisk: 'all',
      analyst: 'all',
      partSearch: '',
      atb: null,
      obs: null,
      tls: null,
      packGroup: 'all',
      sortBy: 'qty',
    });
  };

  return (
    <Box
      sx={{
        maxHeight: isOpen ? '200px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease, opacity 0.2s',
        opacity: isOpen ? 1 : 0,
        bgcolor: 'background.paper',
        borderBottom: isOpen ? 1 : 0,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          p: { xs: 2, sm: 2, md: 2.5 },
          px: { xs: 2, sm: 3, md: 4 },
          flexWrap: 'wrap',
        }}
      >
        {/* Site Filter */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Site</InputLabel>
          <Select
            value={filters.site}
            label="Site"
            onChange={(e) => setFilters({ ...filters, site: e.target.value as 'both' | 'WBN' | 'STA' })}
            sx={{
              bgcolor: filters.site !== 'both' ? 'primary.main' : 'background.default',
              color: filters.site !== 'both' ? 'white' : 'text.primary',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: filters.site !== 'both' ? 'primary.main' : 'divider',
                borderWidth: '2px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '& .MuiSvgIcon-root': {
                color: filters.site !== 'both' ? 'white' : 'text.primary',
              },
            }}
          >
            <MenuItem value="both">🌐 Both Sites</MenuItem>
            <MenuItem value="WBN">WBN</MenuItem>
            <MenuItem value="STA">STA</MenuItem>
          </Select>
        </FormControl>

        {/* Horizon Filter */}
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Horizon</InputLabel>
          <Select
            value={filters.horizon}
            label="Horizon"
            onChange={(e) => setFilters({ ...filters, horizon: Number(e.target.value) as 30 | 60 | 90 | 120 })}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            }}
          >
            <MenuItem value={30}>30 Days</MenuItem>
            <MenuItem value={60}>60 Days</MenuItem>
            <MenuItem value={90}>90 Days</MenuItem>
            <MenuItem value={120}>120 Days</MenuItem>
          </Select>
        </FormControl>

        {/* Vendor Filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Vendor</InputLabel>
          <Select
            value={filters.vendor}
            label="Vendor"
            onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
            sx={{
              bgcolor: filters.vendor !== 'all' ? 'primary.main' : 'background.default',
              color: filters.vendor !== 'all' ? 'white' : 'text.primary',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: filters.vendor !== 'all' ? 'primary.main' : 'divider',
                borderWidth: '2px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '& .MuiSvgIcon-root': {
                color: filters.vendor !== 'all' ? 'white' : 'text.primary',
              },
            }}
          >
            <MenuItem value="all">All Vendors</MenuItem>
            {vendors.map(v => (
              <MenuItem key={v} value={v}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Risk Filter */}
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Risk</InputLabel>
          <Select
            value={filters.risk}
            label="Risk"
            onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
            sx={{
              bgcolor: filters.risk !== 'all' ? 'primary.main' : 'background.default',
              color: filters.risk !== 'all' ? 'white' : 'text.primary',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: filters.risk !== 'all' ? 'primary.main' : 'divider',
                borderWidth: '2px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '& .MuiSvgIcon-root': {
                color: filters.risk !== 'all' ? 'white' : 'text.primary',
              },
            }}
          >
            <MenuItem value="all">All Risks</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>

        {/* Analyst Filter */}
        {analysts.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Analyst</InputLabel>
            <Select
              value={filters.analyst}
              label="Analyst"
              onChange={(e) => setFilters({ ...filters, analyst: e.target.value })}
              sx={{
                bgcolor: filters.analyst !== 'all' ? 'primary.main' : 'background.default',
                color: filters.analyst !== 'all' ? 'white' : 'text.primary',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: filters.analyst !== 'all' ? 'primary.main' : 'divider',
                  borderWidth: '2px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '& .MuiSvgIcon-root': {
                  color: filters.analyst !== 'all' ? 'white' : 'text.primary',
                },
              }}
            >
              <MenuItem value="all">All Analysts</MenuItem>
              {analysts.map(a => (
                <MenuItem key={a} value={a}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Part Search */}
        <TextField
          size="small"
          placeholder="Search part..."
          value={filters.partSearch}
          onChange={(e) => setFilters({ ...filters, partSearch: e.target.value })}
          sx={{
            minWidth: 130,
            '& .MuiOutlinedInput-root': {
              bgcolor: filters.partSearch ? 'primary.main' : 'background.default',
              color: filters.partSearch ? 'white' : 'text.primary',
              '& fieldset': {
                borderColor: filters.partSearch ? 'primary.main' : 'divider',
                borderWidth: '2px',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '& input::placeholder': {
                color: filters.partSearch ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                opacity: 1,
              },
            },
          }}
        />

        {/* Filter Actions */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeFilterCount > 0 && (
            <Box
              component="span"
              sx={{
                fontSize: '0.75rem',
                color: 'text.secondary',
                fontWeight: 600,
                display: { xs: 'none', sm: 'inline' },
              }}
            >
              {activeFilterCount} active
            </Box>
          )}
          <Button
            onClick={handleClearFilters}
            disabled={activeFilterCount === 0}
            startIcon={<Clear />}
            variant="outlined"
            size="small"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.75rem',
              opacity: activeFilterCount > 0 ? 1 : 0.5,
              px: 1.5,
              py: 0.5,
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// Made with Bob
