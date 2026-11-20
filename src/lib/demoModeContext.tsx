import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type DemoMode = 'tanpa-cctv' | 'cctv';

interface DemoModeContextType {
  mode: DemoMode;
  setMode: (mode: DemoMode) => void;
  toggleMode: () => void;
  isCctvEnabled: boolean;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize mode based on pathname if specific route is accessed
  const [mode, setModeState] = useState<DemoMode>(() => {
    if (location.pathname.includes('tanpa-cctv')) return 'tanpa-cctv';
    if (location.pathname.includes('cctv')) return 'cctv';
    const saved = localStorage.getItem('billboard_demo_mode') as DemoMode;
    return saved === 'cctv' ? 'cctv' : 'tanpa-cctv'; // default to clean tanpa-cctv
  });

  // Keep route synced if user navigates to /tanpa-cctv or /cctv
  useEffect(() => {
    if (location.pathname.includes('tanpa-cctv') && mode !== 'tanpa-cctv') {
      setModeState('tanpa-cctv');
    } else if (location.pathname.includes('cctv') && mode !== 'cctv') {
      setModeState('cctv');
    }
  }, [location.pathname]);

  const setMode = (newMode: DemoMode) => {
    setModeState(newMode);
    localStorage.setItem('billboard_demo_mode', newMode);
  };

  const toggleMode = () => {
    const nextMode = mode === 'cctv' ? 'tanpa-cctv' : 'cctv';
    setMode(nextMode);
  };

  return (
    <DemoModeContext.Provider 
      value={{ 
        mode, 
        setMode, 
        toggleMode, 
        isCctvEnabled: mode === 'cctv' 
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};
