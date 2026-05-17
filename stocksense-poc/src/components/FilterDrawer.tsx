import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Clear, FilterList } from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { defaultFilters } from '../utils/defaultFilters';

interface FilterDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

const booleanValue = (value: boolean | null) => {
  if (value === null) return 'all';
  return value ? 'true' : 'false';
};

const parseBooleanValue = (value: string) => {
  if (value === 'all') return null;
  return value === 'true';
};

const getActiveFilterCount = (filters: ReturnType<typeof useData>['filters']) =>
  [
    filters.site !== defaultFilters.site,
    filters.horizon !== defaultFilters.horizon,
    filters.vendor !== defaultFilters.vendor,
    filters.viewMode !== 'understock' && filters.risk !== defaultFilters.risk,
    filters.viewMode !== 'overstock' && filters.shortageRisk !== defaultFilters.shortageRisk,
    filters.analyst !== defaultFilters.analyst,
    filters.partSearch,
    filters.atb !== defaultFilters.atb,
    filters.obs !== defaultFilters.obs,
    filters.tls !== defaultFilters.tls,
    filters.packGroup !== defaultFilters.packGroup,
  ].filter(Boolean).length;

export function FilterButton({ isOpen, onToggle }: FilterDrawerProps) {
  const { filters } = useData();
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <Button
      aria-expanded={isOpen}
      onClick={onToggle}
      startIcon={<FilterList />}
      variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.875rem',
        px: { xs: 1.5, sm: 2 },
        py: 0.8,
        minWidth: 'auto',
        whiteSpace: 'nowrap',
      }}
    >
      Filters
      {activeFilterCount > 0 && (
        <Chip
          label={activeFilterCount}
          size="small"
          sx={{
            ml: 1,
            height: 18,
            minWidth: 18,
            fontSize: '0.7rem',
            fontWeight: 800,
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

  const vendors = Array.from(
    new Map(parts.map((p) => [p.vendor, p.vname || p.vendor])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));
  const analysts = Array.from(new Set(parts.map((p) => p.analyst).filter(Boolean))).sort();
  const packGroups = Array.from(new Set(parts.map((p) => p.packGroup).filter(Boolean))).sort();
  const activeFilterCount = getActiveFilterCount(filters);
  const showOverRisk = filters.viewMode !== 'understock';
  const showShortRisk = filters.viewMode !== 'overstock';

  const handleClearFilters = () => {
    setFilters({ ...defaultFilters, viewMode: filters.viewMode });
  };

  const selectSx = (active: boolean) => ({
    bgcolor: active ? 'primary.main' : 'background.default',
    color: active ? 'primary.contrastText' : 'text.primary',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: active ? 'primary.main' : 'divider',
      borderWidth: '1px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
    '& .MuiSvgIcon-root': {
      color: active ? 'primary.contrastText' : 'text.secondary',
    },
  });

  return (
    <Box
      aria-hidden={!isOpen}
      sx={{
        maxHeight: isOpen ? { xs: '70vh', md: '300px' } : '0px',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'max-height 0.28s ease, opacity 0.2s ease',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        bgcolor: 'background.paper',
        borderBottom: isOpen ? 1 : 0,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          px: { xs: 2, sm: 3, md: 4 },
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(6, minmax(130px, 1fr))',
            xl: 'repeat(10, minmax(120px, 1fr))',
          },
          gap: { xs: 1.25, md: 1.5 },
          alignItems: 'center',
        }}
      >
        <FormControl size="small">
          <InputLabel>Site</InputLabel>
          <Select
            value={filters.site}
            label="Site"
            onChange={(e) => setFilters({ ...filters, site: e.target.value as 'both' | 'WBN' | 'STA' })}
            sx={selectSx(filters.site !== defaultFilters.site)}
          >
            <MenuItem value="both">Both sites</MenuItem>
            <MenuItem value="WBN">WBN</MenuItem>
            <MenuItem value="STA">STA</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Horizon</InputLabel>
          <Select
            value={filters.horizon}
            label="Horizon"
            onChange={(e) => setFilters({ ...filters, horizon: Number(e.target.value) as 30 | 60 | 90 | 120 })}
            sx={selectSx(filters.horizon !== defaultFilters.horizon)}
          >
            <MenuItem value={30}>30 days</MenuItem>
            <MenuItem value={60}>60 days</MenuItem>
            <MenuItem value={90}>90 days</MenuItem>
            <MenuItem value={120}>120 days</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Vendor</InputLabel>
          <Select
            value={filters.vendor}
            label="Vendor"
            onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
            sx={selectSx(filters.vendor !== defaultFilters.vendor)}
          >
            <MenuItem value="all">All vendors</MenuItem>
            {vendors.map(([code, name]) => (
              <MenuItem key={code} value={code}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {showOverRisk && (
          <FormControl size="small">
            <InputLabel>Over risk</InputLabel>
            <Select
              value={filters.risk}
              label="Over risk"
              onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
              sx={selectSx(filters.risk !== defaultFilters.risk)}
            >
              <MenuItem value="all">All risks</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="None">None</MenuItem>
            </Select>
          </FormControl>
        )}

        {showShortRisk && (
          <FormControl size="small">
            <InputLabel>Short risk</InputLabel>
            <Select
              value={filters.shortageRisk}
              label="Short risk"
              onChange={(e) => setFilters({ ...filters, shortageRisk: e.target.value })}
              sx={selectSx(filters.shortageRisk !== defaultFilters.shortageRisk)}
            >
              <MenuItem value="all">All risks</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="None">None</MenuItem>
            </Select>
          </FormControl>
        )}

        <FormControl size="small">
          <InputLabel>Analyst</InputLabel>
          <Select
            value={filters.analyst}
            label="Analyst"
            onChange={(e) => setFilters({ ...filters, analyst: e.target.value })}
            sx={selectSx(filters.analyst !== defaultFilters.analyst)}
          >
            <MenuItem value="all">All analysts</MenuItem>
            {analysts.map((analyst) => (
              <MenuItem key={analyst} value={analyst}>
                {analyst}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search part, vendor, site..."
          value={filters.partSearch}
          onChange={(e) => setFilters({ ...filters, partSearch: e.target.value })}
          sx={{
            gridColumn: { xs: '1 / -1', md: 'span 2' },
            '& .MuiOutlinedInput-root': {
              bgcolor: filters.partSearch ? 'primary.main' : 'background.default',
              color: filters.partSearch ? 'primary.contrastText' : 'text.primary',
              '& fieldset': {
                borderColor: filters.partSearch ? 'primary.main' : 'divider',
              },
              '& input::placeholder': {
                color: filters.partSearch ? 'rgba(255, 255, 255, 0.75)' : 'text.secondary',
                opacity: 1,
              },
            },
          }}
        />

        <FormControl size="small">
          <InputLabel>Pack group</InputLabel>
          <Select
            value={filters.packGroup}
            label="Pack group"
            onChange={(e) => setFilters({ ...filters, packGroup: e.target.value })}
            sx={selectSx(filters.packGroup !== defaultFilters.packGroup)}
          >
            <MenuItem value="all">All groups</MenuItem>
            {packGroups.map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>ATB</InputLabel>
          <Select
            value={booleanValue(filters.atb)}
            label="ATB"
            onChange={(e) => setFilters({ ...filters, atb: parseBooleanValue(e.target.value) })}
            sx={selectSx(filters.atb !== defaultFilters.atb)}
          >
            <MenuItem value="all">Any ATB</MenuItem>
            <MenuItem value="true">ATB only</MenuItem>
            <MenuItem value="false">No ATB</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Obsolete</InputLabel>
          <Select
            value={booleanValue(filters.obs)}
            label="Obsolete"
            onChange={(e) => setFilters({ ...filters, obs: parseBooleanValue(e.target.value) })}
            sx={selectSx(filters.obs !== defaultFilters.obs)}
          >
            <MenuItem value="all">Any status</MenuItem>
            <MenuItem value="true">Obsolete only</MenuItem>
            <MenuItem value="false">Active only</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>TLS</InputLabel>
          <Select
            value={booleanValue(filters.tls)}
            label="TLS"
            onChange={(e) => setFilters({ ...filters, tls: parseBooleanValue(e.target.value) })}
            sx={selectSx(filters.tls !== defaultFilters.tls)}
          >
            <MenuItem value="all">Any TLS</MenuItem>
            <MenuItem value="true">TLS only</MenuItem>
            <MenuItem value="false">Non-TLS</MenuItem>
          </Select>
        </FormControl>

        <Box
          sx={{
            gridColumn: { xs: '1 / -1', md: 'span 2' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', md: 'flex-end' },
            gap: 1,
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
            {activeFilterCount === 0 ? 'No active filters' : `${activeFilterCount} active`}
          </Typography>
          <Button
            onClick={handleClearFilters}
            disabled={activeFilterCount === 0}
            startIcon={<Clear />}
            variant="outlined"
            size="small"
            color="error"
          >
            Clear
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// Made with Bob
