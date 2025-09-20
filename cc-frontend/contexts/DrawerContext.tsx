import React, { createContext, useContext, useState } from 'react';

interface DrawerContextType {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => {
    console.log('🍔 Opening side drawer');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    console.log('🚪 Closing side drawer');
    setIsDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(prev => !prev);
  };

  const value = {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer
  };

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
}
