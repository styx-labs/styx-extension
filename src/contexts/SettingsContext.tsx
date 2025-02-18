import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextType {
  autoMode: boolean;
  setAutoMode: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [autoMode, setAutoMode] = useState(() => {
    const saved = localStorage.getItem("autoMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("autoMode", JSON.stringify(autoMode));
  }, [autoMode]);

  return (
    <SettingsContext.Provider
      value={{
        autoMode,
        setAutoMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
