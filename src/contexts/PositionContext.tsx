import React, { createContext, useContext } from 'react';

interface PositionContextType {
  isOnRight: boolean;
}

export const PositionContext = createContext<PositionContextType>({ isOnRight: true });

export const usePosition = () => useContext(PositionContext);
