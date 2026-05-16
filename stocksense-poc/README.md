# StockSense POC — Inventory Health Intelligence

A browser-based inventory health analysis tool built for the IBM Bob Hackathon. Automates overstock and understock detection across multiple time horizons.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will open at `http://localhost:5173`

## 📋 Features

### ✅ Implemented (MVP)
- **Upload Screen** with ERP/WMS selector
- **Demo Data Button** — instant analysis with realistic data
- **Dashboard** with 6 tabs (Overview, Analysis, Overstock, Understock, All Parts, Not on MRP)
- **KPI Cards** showing:
  - Overstocked parts count
  - Total overstock quantity
  - Critical risk parts
  - Overstock value (GBP)
  - Overstock volume (m³)
  - Understocked parts count
  - Total shortage quantity
  - Critical shortage parts
  - Shortage value at risk
- **Dark Theme** with StockSense branding
- **Responsive Design** with Material-UI

### 🚧 Coming Next
- Data tables with sorting/filtering
- Chart.js visualizations
- Filter drawer
- Excel export
- Snapshot save/load
- Real file upload with SheetJS

## 🎯 Demo Instructions

1. Click **"Load Demo Data"** on the upload screen
2. View the **Overview** tab with all KPIs
3. Switch between tabs to explore different views
4. Note the realistic data:
   - ~96 overstocked parts
   - ~30 understocked parts
   - £2-3M overstock value
   - £500k-1M shortage value at risk

## 🏗️ Project Structure

```
stocksense-poc/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # App header with branding
│   │   ├── UploadScreen.tsx    # File upload & demo data
│   │   ├── Dashboard.tsx       # Main dashboard with tabs
│   │   └── KPICard.tsx         # Reusable KPI card
│   ├── context/
│   │   └── DataContext.tsx     # Global state management
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── utils/
│   │   └── dummyData.ts        # Demo data generator
│   ├── theme.ts                # MUI theme config
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
├── index.html
└── package.json
```

## 🎨 Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v9
- **Charts**: Chart.js (ready to integrate)
- **File Processing**: SheetJS (xlsx) — client-side only
- **State Management**: React Context API

## 📊 Data Model

Each part contains:
- Part number, site, vendor info
- Stock on hand (SOH)
- Demand for 4 horizons (30/60/90/120 days)
- Overstock/understock calculations
- Risk scores (Critical/High/Medium/Low)
- Packaging, volume, price data
- Flags (ATB, Obsolete, TLS)

## 🔧 ERP/WMS Support

Supports field mapping for:
- 📊 Standard / Custom
- 🔷 SAP MM / EWM
- 🔴 Oracle SCM
- 🟦 Dynamics 365
- 🟠 Infor WMS
- 🟣 Manhattan Associates

## 🎬 3-Minute Demo Script

1. **Opening** (30s): "Every supply chain team wastes hours in Excel. StockSense automates this."
2. **Demo Load** (15s): Click "Load Demo Data" → Show instant analysis
3. **Dashboard Tour** (60s): Show KPIs, explain overstock vs understock
4. **ERP Compatibility** (30s): Switch ERP systems
5. **IBM Bob Story** (30s): "Built with IBM Bob as our development partner..."

## 🏆 Hackathon Submission

**Problem**: Manual inventory analysis takes 4-8 hours/week, costs millions in excess stock and production delays

**Solution**: 4-second automated analysis with universal ERP compatibility

**Innovation**: 
- Zero-install browser app
- Client-side processing
- Works with any ERP system
- Detects both overstock AND understock

**Impact**: 
- 200+ hours saved per analyst per year
- Millions in excess inventory identified
- Production delays prevented

**IBM Bob Contribution**:
- Designed ERP compatibility layer
- Extended analysis from overstock-only to full inventory health
- Created risk scoring algorithms
- Generated realistic dummy data
- Helped turn company-specific tool into universal platform

## 📝 Development Notes

### Known Issues
- Grid component uses flexbox instead of MUI Grid (v9 API compatibility)
- Some ESLint warnings about fast refresh (non-blocking)
- Dashboard tabs 2-6 show placeholder content

### Next Steps
1. Add data tables with sorting/filtering
2. Implement Chart.js visualizations
3. Build filter drawer component
4. Add Excel export with SheetJS
5. Implement snapshot save/load
6. Add real file upload functionality
7. Deploy to Vercel/Netlify

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Push dist/ to gh-pages branch
```

## 📄 License

Built for IBM Bob Hackathon 2026

---

**StockSense v1.0** — Know Your Inventory. Fix It Faster.
