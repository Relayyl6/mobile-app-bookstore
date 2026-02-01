import library from "../assets/icons/Library-amico.png";
import home from "../assets/icons/Library-bro.png";
import profile from "../assets/icons/Library-pana.png";
import settings from "../assets/icons/Library-rafiki.png";

const icons = {
    library,
    home,
    profile,
    settings
}

export default icons


export function formatISBN13(isbn: string) {
return `${isbn.slice(0,3)}-${isbn.slice(3,4)}-${isbn.slice(4,8)}-${isbn.slice(8,12)}-${isbn.slice(12)}`;
}

export function generateISBN13(setShowIsbnModal: any) {
  setShowIsbnModal(true);
  const prefix = '978'; // Standard book prefix

  // Generate 9 random digits
  let body = '';
  for (let i = 0; i < 9; i++) {
    body += Math.floor(Math.random() * 10);
  }

  const partialISBN = prefix + body;

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < partialISBN.length; i++) {
    const digit = Number(partialISBN[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checksum = (10 - (sum % 10)) % 10;

  return `${partialISBN}${checksum}`;
}


export const GENRES = [
    "Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Science Fiction",
    "Fantasy",
    "Horror",
    "Historical Fiction",
    "Non-Fiction",
    "Biography",
    "Memoir",
    "Self-Help",
    "Business",
    "Psychology",
    "Philosophy",
    "History",
    "Science",
    "Technology",
    "Travel",
    "Cooking",
    "Art & Photography",
    "Poetry",
    "Drama",
    "Crime",
    "Adventure",
    "Young Adult",
    "Children's",
    "Graphic Novel",
    "Comedy",
    "Education",
    "others"
]

export const fileTypes: FileTypeOption[] = [
    { id: 'photo', icon: 'image-outline', label: 'Photo' },
    { id: 'video', icon: 'videocam-outline', label: 'Video' },
    { id: 'document', icon: 'document-text-outline', label: 'File' },
    { id: 'audio', icon: 'musical-notes-outline', label: 'Audio' },
  ]

export const contextOptions: ContextOption[] = [
    {
      id: 'quick-answer',
      label: 'Quick Answer',
      icon: 'flash-outline',
      description: 'Fast, concise response',
    },
    {
      id: 'deep-research',
      label: 'Deep Research',
      icon: 'search-outline',
      description: 'Comprehensive analysis',
    },
    {
      id: 'web-search',
      label: 'Web Search',
      icon: 'globe-outline',
      description: 'Search the web for context',
    },
    {
      id: 'book-depth',
      label: 'Book Depth',
      icon: 'book-outline',
      description: 'Analyze entire book context',
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: 'list-outline',
      description: 'Extract key points',
    },
  ]