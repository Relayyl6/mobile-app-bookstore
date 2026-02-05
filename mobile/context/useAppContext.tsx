import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightThemes, darkThemes } from '@/constants/theme';
import icons from '@/constants/data';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [currentTheme, setCurrentThemeState] = useState<ThemeType>('forest');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("")
  const [bookId, setBookId] = useState("")
  const [show, setShow] = useState(false)
  

  // Load theme preferences from storage
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        const savedCurrentTheme = await AsyncStorage.getItem('currentTheme');
        
        if (savedThemeMode) setThemeModeState(savedThemeMode as ThemeMode);
        if (savedCurrentTheme) setCurrentThemeState(savedCurrentTheme as ThemeType);
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreferences();
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem('themeMode', mode);
  };

  const setCurrentTheme = (theme: ThemeType) => {
    setCurrentThemeState(theme);
    AsyncStorage.setItem('currentTheme', theme);
  };

  const toggleThemeMode = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const colors = themeMode === 'light'
    ? lightThemes[currentTheme]
    : darkThemes[currentTheme];

  // Theme-based icon mapping
  const getThemeIcon = (): any => {
    const themeIconMap: { [key in ThemeType]: any } = {
      ocean: icons.library,
      retro: icons.home,
      forest: icons.profile,
      blossom: icons.settings,
      cyberpunk: icons.library,
    };

    return themeIconMap[currentTheme];
  };

  const iconsuse: IconTheme = {
    ...icons,
    themeIcon: getThemeIcon(), // Dynamic icon based on current theme
  };


  const value: AppContextType = {
    colors,
    iconsuse,
    themeMode,
    currentTheme,
    setThemeMode,
    setCurrentTheme,
    toggleThemeMode,
    userId,
    setUserId,
    bookId,
    setBookId
  };

  if (isLoading) {
    return null; // or a loading screen
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
