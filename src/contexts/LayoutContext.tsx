import React, { createContext, useContext, useState, useEffect } from "react";

interface LayoutContextType {
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  isHeightExpanded: boolean;
  setHeightExpanded: (expanded: boolean) => void;
  containerMaxHeight: string;
  containerWidth: string;
  containerHeight: string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

interface LayoutProviderProps {
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem("candidateSidebarExpanded");
    return saved ? JSON.parse(saved) : false;
  });

  const [isHeightExpanded, setHeightExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebarHeightExpanded");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(
      "candidateSidebarExpanded",
      JSON.stringify(sidebarExpanded)
    );
  }, [sidebarExpanded]);

  useEffect(() => {
    localStorage.setItem(
      "sidebarHeightExpanded",
      JSON.stringify(isHeightExpanded)
    );
  }, [isHeightExpanded]);

  const handleSetHeightExpanded = (expanded: boolean) => {
    setHeightExpanded(expanded);
    localStorage.setItem("sidebarHeightExpanded", JSON.stringify(expanded));
  };

  const handleSetSidebarExpanded = (expanded: boolean) => {
    setSidebarExpanded(expanded);
    localStorage.setItem("candidateSidebarExpanded", JSON.stringify(expanded));
  };

  const containerMaxHeight = isHeightExpanded ? "100vh" : "600px";
  const containerWidth = "450px";
  const containerHeight =
    isHeightExpanded && sidebarExpanded ? "100vh" : "auto";

  return (
    <LayoutContext.Provider
      value={{
        sidebarExpanded,
        setSidebarExpanded: handleSetSidebarExpanded,
        isHeightExpanded,
        setHeightExpanded: handleSetHeightExpanded,
        containerMaxHeight,
        containerWidth,
        containerHeight,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
