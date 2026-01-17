// Color Interface
declare interface ColorScheme {
  primary: string;
  textPrimary: string;
  textSecondary: string;
  textDark: string;
  placeholderText: string;
  background: string;
  cardBackground: string;
  inputBackground: string;
  border: string;
  white: string;
  black: string;
}

declare type ThemeType = 'forest' | 'retro' | 'ocean' | 'blossom';
declare type ThemeMode = 'light' | 'dark';

declare interface AppContextType {
  colors: ColorScheme;
  themeMode: ThemeMode;
  currentTheme: ThemeType;
  setThemeMode: (mode: ThemeMode) => void;
  setCurrentTheme: (theme: ThemeType) => void;
  toggleThemeMode: () => void;
}

// Image Module Declarations
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}