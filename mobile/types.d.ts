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

/* ======================================================
   TYPES
====================================================== */

declare interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  book?: T
  message?: string
  description?: string
  notes?: any[]
  bookmarks?: any[]
  tableOfContents?: any[]
  chapter?: any
  userProgress?: any
}

declare interface SingleBook {
  // Basic metadata 
  _id: string 
  title: string
  subTitle?: string
  author?: string
  isbn?: string
  caption?: string
  description?: string
  genres?: string[]
  coverImage: string
  price?: number | string | undefined
  publishedYear?: number

  // Stats
  averageRating: number
  totalRatings: number
  totalViews: number
  totalPurchases: number

  // Content
  hasContent: boolean
  totalPages: number
  
  // AI knowledge
  aiKnowledge?: {
    summary?: string
    majorThemes?: string[]
    tone?: string
    characters?: {
      name: string
      description: string
      role?: string
    }[] } | null | undefined
      
  // Reading progress
  readingProgress?: {
    currentChapter: number
    currentPage: number
    progressPercentage: number
    lastReadAt: string
    bookmarks: any[]
    notes: any[]
  } | null
  
  // Uploader
  uploader: {
    username: string
    profileImage: string
  }
}

declare interface DisplayBook {
  _id: string
  title: string
  author: string
  genres: string[]
  averageRating: number
  totalPages?: number
  coverImage?: string
  image?: string
}

declare interface ReadingLibraryResponse {
  success: boolean
  page: number
  totalPages: number
  totalBooks: number
  books: ReadingBook[]
}

declare interface BookForReading {
  bookId: string
  title: string
  author: string
  genres: string[]
  publishedYear: number
  coverImage: string
  progressPercentage: number
  lastReadAt: string | null
  currentChapter: number
  averageRating: number
  totalPages: number
}

declare interface GetBooksForReadingResponse {
  success: boolean
  page: number
  totalPages: number
  totalBooks: number
  books: BookForReading[]
}

declare interface Book {
  _id: string
  bookId: string
  coverImage: string
  progressPercentage: number
  title: string
  subTitle?: string
  author?: string
  image: string
  rating?: number
  pages?: number,
  totalPages?: number,
  genre?: string
  genres?: string[],
  price: number | string 
  description?: string
  progress?: number
  lastRead?: string
  isbn?: string
  user: {
    _id: string
    username: string
    profileImage: string
  }
  createdAt: string
  updatedAt: string
}

declare interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  fileTypes?: string[]
  aiContexts?: string[]
}

declare type ThemeType = 'forest' | 'retro' | 'ocean' | 'blossom' | 'cyberpunk' | 'homeColors' | 'profileColors' | 'libraryColors' | 'greenTheme' | 'purpleTheme' | 'sunsetTheme' | 'grayTheme' | 'cyberpunkTheme';
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
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
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
  fileTypes?: FileType[]
  aiContexts?: AIContext[]
}

declare interface Character {
  name: string
  description: string
  role?: string
}

declare interface BookDetailsProps {
  coverImage: any; // Image source
  title: string;
  subtitle: string;
  author: string;
  authorColor?: string;
  price: any;
  pages: number;
  rating: number;
  currentProgress: number;
  lastRead: string;
  genres: string[];
  plotSummary: string;
  characters: Character[];
  theme: string;
  themeDescription: string;
  tone: string;
  toneDescription: string;
  pacing: string;
  isbn: string;
  onBack?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  onReadNow?: () => void;
  onAIAnalysis?: () => void;
}

declare type BookListHandle = {
  loadMore: () => void | Promise<void>
}

declare interface AttachmentPopupProps {
  visible: boolean
  onClose: () => void
  onConfirm: (selectedItems: { fileTypes: FileType[]; contexts: AIContext[] }) => void
  // Position of the attach button (pass this from the chat screen)
  buttonPosition?: { x: number; y: number }
}




// Returned by formatBookForRecommendation — used by getRecommendations
declare interface RecommendedBook {
  id: string              // note: id not _id
  title: string
  author: string
  genres: string[]
  image: string
  price: number
  averageRating: number
  totalRatings: number
  hasContent: boolean
  publishedYear: number
  totalPages: number
}

// Returned by getPopularBooks + getNewReleases + getTrendingBooks
// Raw Mongoose docs with populated user field
declare interface PopularBook {
  _id: string
  title: string
  author: string
  genres: string[]
  image: string
  price: number
  averageRating: number
  totalRatings: number
  totalPurchases: number
  totalViews: number
  hasContent: boolean
  publishedYear: number
  totalPages: number
  createdAt: string
  user: {
    username: string
    profileImage: string
  }
}

// Returned by getSimilarBooks — same as PopularBook but no populated user
declare interface SimilarBook {
  _id: string
  title: string
  author: string
  genres: string[]
  image: string
  price: number
  averageRating: number
  totalRatings: number
  totalPurchases: number
  hasContent: boolean
  publishedYear: number
}

// API response wrappers
declare interface RecommendationResponse {
  success: boolean
  recommendations: RecommendedBook[]
}

declare interface PopularBooksResponse {
  success: boolean
  popularBooks: PopularBook[]
}

declare interface NewBooksResponse {
  success: boolean
  newBooks: PopularBook[]  // same shape, just sorted by createdAt
}

declare interface SimilarBooksResponse {
  success: boolean
  books: SimilarBook[]
}


declare interface NotesResponse {
  success: boolean
  notes: any[]
}

declare interface BookmarksResponse {
  success: boolean
  bookmarks: any[]
}

declare interface TableOfContentsResponse {
  success: boolean
  tableOfContents: any[]
}

declare interface ChapterContentResponse {
  success: boolean
  chapter: any
  userProgress: any
}

declare interface AddNoteResponse {
  success: boolean
  notes: any[]
}