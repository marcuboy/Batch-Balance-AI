import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Part, FilterState, ERPSystem } from '../types';
import { DEMO_DATA } from '../utils/dummyData';

interface DataContextType {
  parts: Part[];
  setParts: (parts: Part[]) => void;
  filteredParts: Part[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  erpSystem: ERPSystem;
  setErpSystem: (system: ERPSystem) => void;
  mrpDate: string;
  setMrpDate: (date: string) => void;
  loadDemoData: () => void;
  applyFilters: () => void;
}

const defaultFilters: FilterState = {
  site: 'both',
  horizon: 30,
  vendor: 'all',
  risk: 'all',
  shortageRisk: 'all',
  partSearch: '',
  analyst: 'all',
  atb: null,
  obs: null,
  tls: null,
  packGroup: 'all',
  viewMode: 'both',
  sortBy: 'qty',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [erpSystem, setErpSystem] = useState<ERPSystem>('standard');
  const [mrpDate, setMrpDate] = useState<string>('');

  const loadDemoData = () => {
    setParts(DEMO_DATA);
    setMrpDate(new Date().toISOString().split('T')[0]);
  };

  // Compute filtered parts using useMemo
  const filteredParts = useMemo(() => {
    let filtered = [...parts];

    // Site filter
    if (filters.site !== 'both') {
      filtered = filtered.filter(p => p.site === filters.site);
    }

    // Vendor filter
    if (filters.vendor !== 'all') {
      filtered = filtered.filter(p => p.vendor === filters.vendor);
    }

    // Analyst filter
    if (filters.analyst !== 'all') {
      filtered = filtered.filter(p => p.analyst === filters.analyst);
    }

    // Pack group filter
    if (filters.packGroup !== 'all') {
      filtered = filtered.filter(p => p.packGroup === filters.packGroup);
    }

    // Part search
    if (filters.partSearch) {
      const search = filters.partSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.part.toLowerCase().includes(search) ||
        p.vname.toLowerCase().includes(search)
      );
    }

    // Risk filters
    if (filters.risk !== 'all') {
      filtered = filtered.filter(p => p.risk === filters.risk);
    }

    if (filters.shortageRisk !== 'all') {
      filtered = filtered.filter(p => p.shortageRisk === filters.shortageRisk);
    }

    // Flag filters
    if (filters.atb !== null) {
      filtered = filtered.filter(p => p.atb === filters.atb);
    }

    if (filters.obs !== null) {
      filtered = filtered.filter(p => p.obs === filters.obs);
    }

    if (filters.tls !== null) {
      filtered = filtered.filter(p => p.isTLS === filters.tls);
    }

    // View mode filter
    const horizon = filters.horizon;
    const overKey = `over${horizon}` as keyof Part;
    const underKey = `under${horizon}` as keyof Part;

    if (filters.viewMode === 'overstock') {
      filtered = filtered.filter(p => (p[overKey] as number) > 0);
    } else if (filters.viewMode === 'understock') {
      filtered = filtered.filter(p => (p[underKey] as number) > 0);
    }

    // Sort
    if (filters.sortBy === 'qty') {
      if (filters.viewMode === 'understock') {
        filtered.sort((a, b) => (b[underKey] as number) - (a[underKey] as number));
      } else {
        filtered.sort((a, b) => (b[overKey] as number) - (a[overKey] as number));
      }
    } else if (filters.sortBy === 'volume') {
      const volKey = `ov${horizon}` as keyof Part;
      filtered.sort((a, b) => (b[volKey] as number) - (a[volKey] as number));
    } else if (filters.sortBy === 'value') {
      if (filters.viewMode === 'understock') {
        const valKey = `shortageVal${horizon}` as keyof Part;
        filtered.sort((a, b) => (b[valKey] as number) - (a[valKey] as number));
      } else {
        const valKey = `osVal${horizon}` as keyof Part;
        filtered.sort((a, b) => (b[valKey] as number) - (a[valKey] as number));
      }
    }

    return filtered;
  }, [parts, filters]);

  const applyFilters = () => {
    // This function is kept for backwards compatibility but does nothing
    // Filtering is now handled by useMemo above
  };

  return (
    <DataContext.Provider
      value={{
        parts,
        setParts,
        filteredParts,
        filters,
        setFilters,
        erpSystem,
        setErpSystem,
        mrpDate,
        setMrpDate,
        loadDemoData,
        applyFilters,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Made with Bob
