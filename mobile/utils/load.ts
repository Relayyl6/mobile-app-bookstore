import { GUEST_BOOKS_DETAILS } from "@/components/data";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Load last reading position
export const loadGuestLastPosition = async (bookId: string) => {
  try {
    const lastPosition = await AsyncStorage.getItem(`guest_last_position_${bookId}`);
    if (lastPosition) {
      return JSON.parse(lastPosition);
    }
    
    // Fallback to readingProgress from static data
    const book = GUEST_BOOKS_DETAILS.find(book => book._id === bookId);
    if (book?.readingProgress) {
      return {
        chapterNumber: book.readingProgress.currentChapter,
        pageNumber: book.readingProgress.currentPage,
      };
    }
    
    return null;
  } catch (error) {
    console.log('Failed to load last position:', error);
    return null;
  }
};

// Get all guest books with their latest progress
export const getAllGuestBooksWithProgress = async () => {
  const booksWithProgress = [...GUEST_BOOKS_DETAILS];
  
  for (let i = 0; i < booksWithProgress.length; i++) {
    const book = booksWithProgress[i];
    const savedProgress = await loadGuestBookProgress(book._id);
    if (savedProgress) {
      book.readingProgress = savedProgress;
    }
  }
  
  return booksWithProgress;
};

        // Load saved progress for guest books
export const loadGuestBookProgress = async (bookId: string) => {
  try {
    const savedProgress = await AsyncStorage.getItem(`guest_progress_${bookId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      
      // Update the book's readingProgress field
      const bookIndex = GUEST_BOOKS_DETAILS.findIndex(book => book._id === bookId);
      if (bookIndex !== -1) {
        GUEST_BOOKS_DETAILS[bookIndex].readingProgress = {
          currentChapter: progress.currentChapter,
          currentPage: progress.currentPage,
          progressPercentage: progress.progressPercentage,
          lastReadAt: progress.lastReadAt,
          bookmarks: progress.bookmarks || [],
          notes: progress.notes || [],
        };
      }
      
      return progress;
    }
    
    const book = GUEST_BOOKS_DETAILS.find(book => book._id === bookId);

    if (book?.readingProgress) {
      return book.readingProgress;
    }
    
    return null;
  } catch (error) {
    console.log('Failed to load guest book progress:', error);
    return null;
  }
};

    // Save reading progress for guest books locally
export const saveGuestBookProgress = async (
  bookId: string,
  chapterNumber: number,
  currentPageNumber: number,
  totalPages: number
) => {
  try {
    const progressData = {
      bookId,
      chapterNumber: chapterNumber,
      pageNumber: currentPageNumber,
      progressPercentage: totalPages > 0 
        ? Math.round((currentPageNumber / totalPages) * 100) 
        : 0,
      lastReadAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(
      `guest_progress_${bookId}`, 
      JSON.stringify(progressData)
    );

    const bookIndex = GUEST_BOOKS_DETAILS.findIndex(book => book._id === bookId);
    if (bookIndex !== -1 && GUEST_BOOKS_DETAILS[bookIndex].readingProgress) {
      GUEST_BOOKS_DETAILS[bookIndex].readingProgress = {
        ...GUEST_BOOKS_DETAILS[bookIndex].readingProgress,
        currentChapter: progressData.chapterNumber,
        currentPage: progressData.pageNumber,
        progressPercentage: progressData.progressPercentage,
        lastReadAt: progressData.lastReadAt,
      };
    }
    
    // Also store the last read position for each book
    await AsyncStorage.setItem(
      `guest_last_position_${bookId}`,
      JSON.stringify({
        chapterNumber,
        pageNumber: currentPageNumber,
      })
    );
    
    console.log('Guest book progress saved locally');

    return progressData;
  } catch (error) {
    console.log('Failed to save guest book progress:', error);
  }
};