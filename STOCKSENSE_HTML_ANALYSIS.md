# StockSense.html Analysis & Implementation Plan

## Overview
The StockSense.html file is a complete single-file application with ~1920 lines containing:
- Inline CSS styling
- Complete JavaScript logic
- HTML structure
- Chart.js integration
- SheetJS (xlsx) integration

## Key Features to Replicate

### 1. **Visual Design & Styling**
- **Color Palette**: Teal-green theme (#00685F primary, #008F82 accent)
- **Typography**: Bebas Neue (headers), DM Sans (body), JetBrains Mono (code/numbers)
- **Background**: Subtle hex grid pattern + radial glow effect
- **Cards**: Glass-morphism with borders and hover effects
- **Animations**: Fade-up animations on KPI cards with staggered delays

### 2. **Header Component**
✅ Already implemented, but needs:
- Logo with "SS" icon (currently missing)
- "OVERSTOCK INTEL" subtitle
- MRP date badge
- Export button (context-aware label)
- Save Snapshot button
- "Load New Files" reset button

### 3. **Upload Screen**
✅ Partially implemented, needs:
- ERP selector in top-right corner (not inline)
- 4 drop zones with drag-over states
- File name display when loaded
- "Analyse" button that activates when required files loaded
- Loading screen with spinner

### 4. **Dashboard Navigation**
✅ Basic tabs implemented, needs:
- Sticky nav bar below header
- Filter toggle button with badge count
- Collapsible filter drawer
- 6 tabs: Overview, Analysis, Overstock, Understock, All Parts, Not on MRP

### 5. **Filter Drawer** ❌ NOT IMPLEMENTED
- Collapsible panel below nav tabs
- Filters: Site, Horizon, Vendor, Risk, Analyst, Part Search, Pack Group, Flags
- "Clear All Filters" button
- Active filter highlighting
- Filter count badge

### 6. **Overview Tab** ✅ Partially implemented
- KPI cards in 4-column grid
- Section headers for Overstock/Understock
- Volume banner (if dimension data loaded)
- Charts grid (2 columns)
- Top tables (vendors, analysts)

### 7. **Data Tables** ❌ NOT IMPLEMENTED
- Sortable columns (click header to sort)
- Pagination (50 rows per page)
- Context-aware columns based on tab
- Risk badges (Critical/High/Medium/Low)
- Flag badges (ATB, Obsolete, TLS)
- Number formatting (locale-aware)
- Price formatting (£ symbol, K/M suffixes)
- Volume formatting (m³)

### 8. **Charts** ❌ NOT IMPLEMENTED
- **Overview Tab**:
  - Overstock by Vendor (horizontal bar)
  - Risk Distribution (donut)
  - Overstock Trend (line chart)
  - Volume by Vendor (horizontal bar)
- **Analysis Tab**:
  - Detailed breakdowns
  - Multiple chart types

### 9. **Inventory Mode Toggle** ❌ NOT IMPLEMENTED
- 3-button toggle: Overstock / Both / Understock
- Changes KPI display
- Changes table content
- Changes chart data
- Sticky in nav bar

### 10. **Excel Export** ❌ NOT IMPLEMENTED
- Context-aware (exports active tab)
- Multiple sheets for "Export All"
- Formatted headers
- Auto-column width
- Filename with date and filters

### 11. **Snapshot Save** ❌ NOT IMPLEMENTED
- Saves entire app state to HTML file
- Includes all data in localStorage
- Self-contained (can reopen without server)

### 12. **Understock Tab** ❌ NOT IMPLEMENTED
- Separate table for shortage analysis
- Shortage risk badges (cyan theme)
- Shortage quantity columns
- Shortage value calculations

---

## Implementation Priority for React App

### Phase 1: Core UI Enhancements (2-3 hours)
1. ✅ Update theme colors to match exact palette
2. ✅ Add hex grid background pattern
3. ✅ Update Header with all buttons and logo
4. ✅ Add filter drawer component
5. ✅ Add inventory mode toggle

### Phase 2: Data Tables (2-3 hours)
6. ✅ Create DataTable component with sorting
7. ✅ Add pagination
8. ✅ Add badge components (risk, flags)
9. ✅ Format numbers, prices, volumes
10. ✅ Implement tab switching (Overstock, All Parts, Not on MRP)

### Phase 3: Charts (2-3 hours)
11. ✅ Integrate Chart.js
12. ✅ Create chart components
13. ✅ Implement Overview charts
14. ✅ Implement Analysis charts

### Phase 4: Advanced Features (2-3 hours)
15. ✅ Excel export with SheetJS
16. ✅ Snapshot save/load
17. ✅ Understock table
18. ✅ Filter logic implementation

---

## Key Functions to Port

### Data Processing
- `processData()` - Main data processing pipeline
- `applyFilters()` - Filter application logic
- `calculateKPIs()` - Already implemented in dummyData.ts

### Table Rendering
- `renderTable()` - Main table render with pagination
- `switchTab()` - Tab switching logic
- `srt()` - Column sorting
- `goP()` - Pagination navigation

### Chart Rendering
- `renderCharts()` - Overview charts
- `renderAnalysisCharts()` - Analysis tab charts
- Chart.js configuration objects

### Export
- `exportExcel()` - Multi-sheet Excel export
- `saveSnapshot()` - HTML snapshot generation

### Utilities
- `fmt()` - Number formatting (K/M suffixes)
- `fmtGBP()` - Currency formatting
- `fmtVol()` - Volume formatting
- `fmtDate()` - Date formatting

---

## Component Structure for React App

```
src/
├── components/
│   ├── Header.tsx ✅ (needs updates)
│   ├── UploadScreen.tsx ✅ (needs updates)
│   ├── Dashboard.tsx ✅ (needs expansion)
│   ├── KPICard.tsx ✅
│   ├── FilterDrawer.tsx ❌ NEW
│   ├── InventoryModeToggle.tsx ❌ NEW
│   ├── DataTable.tsx ❌ NEW
│   ├── TablePagination.tsx ❌ NEW
│   ├── RiskBadge.tsx ❌ NEW
│   ├── FlagBadge.tsx ❌ NEW
│   ├── ChartCard.tsx ❌ NEW
│   ├── OverstockChart.tsx ❌ NEW
│   ├── RiskDonutChart.tsx ❌ NEW
│   └── VolumeChart.tsx ❌ NEW
├── utils/
│   ├── dummyData.ts ✅
│   ├── formatters.ts ❌ NEW (fmt, fmtGBP, fmtVol)
│   ├── excelExport.ts ❌ NEW
│   └── snapshotSave.ts ❌ NEW
```

---

## Next Steps

1. **Update theme.ts** with exact color palette
2. **Create FilterDrawer component**
3. **Create DataTable component** with sorting/pagination
4. **Create badge components**
5. **Integrate Chart.js**
6. **Implement Excel export**
7. **Implement snapshot save**

This will bring the React app to feature parity with the HTML version.