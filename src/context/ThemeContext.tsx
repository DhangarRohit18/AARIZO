import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'classic' | 'coral' | 'emerald' | 'luxury';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  label: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'classic',
    name: 'Classic Navy & Sky',
    label: 'Theme 1: Original',
    badge: 'Original',
    primaryColor: '#083B56',
    accentColor: '#176B91',
    bgColor: '#F7FBFE',
    description: 'Original signature deep navy & azure sky palette with frosted elements.'
  },
  {
    id: 'coral',
    name: 'Coral Sunrise & Yellow',
    label: 'Theme 2: Coral & Gold',
    badge: 'Requested',
    primaryColor: '#E76F51',
    accentColor: '#E9C46A',
    bgColor: '#FFFDF9',
    description: 'Vibrant coral, warm coral red, and soft butter yellow.'
  },
  {
    id: 'emerald',
    name: 'Royal Emerald & Mint',
    label: 'Theme 3: Royal Emerald',
    badge: 'Fresh',
    primaryColor: '#0E3B2E',
    accentColor: '#2A9D74',
    bgColor: '#F6FBF8',
    description: 'Deep forest green, mint sage, and refined organic botanical tones.'
  },
  {
    id: 'luxury',
    name: 'Noir & Champagne Gold',
    label: 'Theme 4: Luxury Gold',
    badge: 'Premium',
    primaryColor: '#1A1A1E',
    accentColor: '#C59B27',
    bgColor: '#FAF9F6',
    description: 'Architectural onyx, warm champagne gold, and ivory elevation.'
  }
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aarizo_theme') as ThemeId;
      if (saved && ['classic', 'coral', 'emerald', 'luxury'].includes(saved)) {
        return saved;
      }
    }
    return 'classic';
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aarizo_theme', newTheme);
      if (newTheme === 'classic') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    }
  };

  useEffect(() => {
    if (theme === 'classic') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEME_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
