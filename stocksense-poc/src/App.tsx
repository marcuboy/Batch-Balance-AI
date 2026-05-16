import { useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { getTheme } from './theme';
import Header from './components/Header';
import UploadScreen from './components/UploadScreen';
import Dashboard from './components/Dashboard';
import { DataProvider } from './context/DataContext';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light'); // Default to light mode

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleReset = () => {
    setShowDashboard(false);
    setActiveTab('overview');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Header 
            activeTab={activeTab} 
            themeMode={themeMode}
            onToggleTheme={toggleTheme}
            onReset={handleReset}
          />
          {!showDashboard ? (
            <UploadScreen onAnalyze={() => setShowDashboard(true)} />
          ) : (
            <Dashboard onTabChange={setActiveTab} />
          )}
        </Box>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;

// Made with Bob
