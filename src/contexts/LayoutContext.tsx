import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  isHeightExpanded: boolean;
  setHeightExpanded: (expanded: boolean) => void;
  containerMaxHeight: string;
  containerWidth: string;
  sidebarWidth: string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('candidateSidebarExpanded');
    return saved ? JSON.parse(saved) : false;
  });

  const [isHeightExpanded, setHeightExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarHeightExpanded');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('candidateSidebarExpanded', JSON.stringify(sidebarExpanded));
  }, [sidebarExpanded]);

  useEffect(() => {
    localStorage.setItem('sidebarHeightExpanded', JSON.stringify(isHeightExpanded));
  }, [isHeightExpanded]);

  const handleSetHeightExpanded = (expanded: boolean) => {
    setHeightExpanded(expanded);
    localStorage.setItem('sidebarHeightExpanded', JSON.stringify(expanded));
    
    // If expanding, scroll to top of the page
    if (expanded) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSetSidebarExpanded = (expanded: boolean) => {
    setSidebarExpanded(expanded);
    localStorage.setItem('candidateSidebarExpanded', JSON.stringify(expanded));
  };

  const containerMaxHeight = isHeightExpanded ? '100vh' : '600px';
  const containerWidth = '450px';
  const sidebarWidth = sidebarExpanded ? '800px' : '450px';

  return (
    <LayoutContext.Provider
      value={{
        sidebarExpanded,
        setSidebarExpanded: handleSetSidebarExpanded,
        isHeightExpanded,
        setHeightExpanded: handleSetHeightExpanded,
        containerMaxHeight,
        containerWidth,
        sidebarWidth,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
