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


declare interface IconTheme {
    library: any;
    home: any;
    profile: any;
    settings: any;
    themeIcon?: any;
  }
declare interface AppContextType {
  colors: ColorScheme;
  iconsuse: IconTheme;
  themeMode: ThemeMode;
  currentTheme: ThemeType;
  setThemeMode: (mode: ThemeMode) => void;
  setCurrentTheme: (theme: ThemeType) => void;
  toggleThemeMode: () => void;
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  bookId: string | null;
  setBookId:  React.Dispatch<React.SetStateAction<string | null>>;
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

declare type FileType = 'photo' | 'video' | 'document' | 'audio'
declare type AIContext = 'deep-research' | 'web-search' | 'book-depth' | 'quick-answer' | 'summarize'

declare interface FileTypeOption {
  id: FileType
  icon: keyof typeof Ionicons.glyphMap
  label: string
}

declare interface ContextOption {
  id: AIContext
  label: string
  icon: keyof typeof Ionicons.glyphMap
  description: string
}

declare type MessageRole = 'user' | 'assistant'

declare type FileType = 'photo' | 'video' | 'document' | 'audio'
declare type AIContext = 'deep-research' | 'web-search' | 'book-depth' | 'quick-answer' | 'summarize'

declare interface ChatMessage {
  id: string
  role: MessageRole
  text: string
  timestamp: Date
  fileType?: FileType
  aiContext?: AIContext
}
