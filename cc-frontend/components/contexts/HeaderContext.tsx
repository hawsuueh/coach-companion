import { createContext, useContext, useState, ReactNode } from 'react';

type HeaderContextType = {
  title: string;
  setTitle: (title: string) => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState<string>('Header title'); // Default

  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeader must be used within HeaderProvider');
  return ctx;
};
