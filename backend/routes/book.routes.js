// ============================================
// BOOK ROUTES - ORGANIZED BY FEATURE
// ============================================

import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import multer from 'multer';

// Import controllers
import * as bookController from '../controller/book.controller.js';
import * as chatController from '../controller/chat.controller.js';
import * as readingController from '../controller/reading.controller.js';

const bookRouter = express.Router();

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ============================================
// PART 1: BOOK CATALOG ROUTES (Marketplace)
// ============================================

/**
 * @route   POST /api/v1/books
 * @desc    Create a new book listing (metadata only)
 * @access  Private
 */
bookRouter.post('/', authMiddleware, bookController.createBook);

/**
 * @route   GET /api/v1/books
 * @desc    Get paginated books from catalog
 * @access  Public
 * @query   page, limit
 */
bookRouter.get('/', bookController.getBooks);

/**
 * @route   GET /api/v1/books/:id
 * @desc    Get single book details (metadata + reading info)
 * @access  Private
 */
bookRouter.get('/:id', authMiddleware, bookController.getSingleBook);

/**
 * @route   PUT /api/v1/books/:id
 * @desc    Update book metadata
 * @access  Private (Owner only)
 */
bookRouter.put('/:id', authMiddleware, bookController.updateBook);

/**
 * @route   DELETE /api/v1/books/:id
 * @desc    Delete book completely
 * @access  Private (Owner only)
 */
bookRouter.delete('/:id', authMiddleware, bookController.deleteBook);

// ============================================
// PART 2: CONTENT MANAGEMENT ROUTES (PDF Upload)
// ============================================

/**
 * @route   POST /api/v1/books/:bookId/content
 * @desc    Upload PDF content for an existing book
 * @access  Private (Owner only)
 */
bookRouter.post(
  '/:bookId/content',
  authMiddleware,
  upload.single('file'),
  bookController.uploadBookContent
);

/**
 * @route   POST /api/v1/books/search
 * @desc    Search an existing book for a question within it
 * @access  Private (Owner only)
 * @query   question, id
 */
bookRouter.post(
  '/search',
  bookController.askBookQuestion
);

/**
 * @route   DELETE /api/v1/books/:bookId/content
 * @desc    Delete book content (keeps metadata)
 * @access  Private (Owner only)
 */
bookRouter.delete(
  '/:bookId/content',
  authMiddleware,
  bookController.deleteBookContent
);

/**
 * @route   GET /api/v1/books/reading/library
 * @desc    Get books with reading content
 * @access  Private
 * @query   page
 */
bookRouter.get('/reading/library', authMiddleware, bookController.getBooksForReading);

// ============================================
// PART 3: USER INTERACTION ROUTES (Metrics)
// ============================================

/**
 * @route   POST /api/v1/books/:id/view
 * @desc    Track book view (for recommendations)
 * @access  Private
 */
bookRouter.post('/:id/view', authMiddleware, bookController.trackBookView);

/**
 * @route   POST /api/v1/books/:id/purchase
 * @desc    Track book purchase
 * @access  Private
 */
bookRouter.post('/:id/purchase', authMiddleware, bookController.trackBookPurchase);

/**
 * @route   POST /api/v1/books/ratings
 * @desc    Add or update rating
 * @access  Private
 * @body    { bookId, rating, review }
 */
bookRouter.post('/ratings', authMiddleware, bookController.addOrUpdateRating);

/**
 * @route   DELETE /api/v1/books/:bookId/ratings
 * @desc    Delete rating
 * @access  Private
 */
bookRouter.delete('/:bookId/ratings', authMiddleware, bookController.deleteRating);

// ============================================
// PART 4: RECOMMENDATION ROUTES
// ============================================

/**
 * @route   GET /api/v1/books/recommendations/personalized
 * @desc    Get personalized recommendations
 * @access  Private
 * @query   limit
 */
bookRouter.get(
  '/recommendations/personalized',
  authMiddleware,
  bookController.getRecommendedBooks
);

/**
 * @route   GET /api/v1/books/:bookId/similar
 * @desc    Get similar books
 * @access  Public
 * @query   limit
 */
bookRouter.get('/:bookId/similar', bookController.getSimilarBooks);

/**
 * @route   GET /api/v1/books/recommendations/popular
 * @desc    Get popular books
 * @access  Public
 * @query   limit
 */
bookRouter.get('/recommendations/popular', bookController.getPopularBooks);

/**
 * @route   GET /api/v1/books/recommendations/new
 * @desc    Get new releases
 * @access  Public
 * @query   limit
 */
bookRouter.get('/recommendations/new', bookController.getNewBooks);

// ============================================
// PART 5: AI FEATURES ROUTES
// ============================================

/**
 * @route   POST /api/v1/books/ai/describe-image
 * @desc    Generate description from book cover image
 * @access  Private
 * @body    { imageBase64, title, caption, author }
 */
bookRouter.post(
  '/ai/describe-image',
  authMiddleware,
  bookController.describeImage
);

/**
 * @route   POST /api/v1/books/chat
 * @desc    Chat with AI about a book (or general chat)
 * @access  Private
 * @body    { userId, bookId, message, systemInstruction? }
 */
bookRouter.post('/chat', authMiddleware, chatController.chatWithBook);

/**
 * @route   GET /api/v1/books/chat/:userId/:bookId
 * @desc    Get chat history
 * @access  Private
 */
bookRouter.get(
  '/chat/:userId/:bookId',
  authMiddleware,
  chatController.getChatHistory
);

/**
 * @route   DELETE /api/v1/books/chat/:userId/:bookId
 * @desc    Clear chat history
 * @access  Private
 */
bookRouter.delete(
  '/chat/:userId/:bookId',
  authMiddleware,
  chatController.clearChatHistory
);

/**
 * @route   PUT /api/v1/books/ai/preferences/:userId/:bookId
 * @desc    Update AI preferences for a book
 * @access  Private
 * @body    { tonePreference?, maxSpoilerChapterAllowed? }
 */
bookRouter.put(
  '/ai/preferences/:userId/:bookId',
  authMiddleware,
  chatController.updateAIPreferences
);

// ============================================
// PART 6: READING PROGRESS ROUTES
// ============================================

/**
 * @route   GET /api/v1/books/:bookId/reading/state
 * @desc    Get user's reading state for a book
 * @access  Private
 */
bookRouter.get(
  '/:bookId/reading/state',
  authMiddleware,
  readingController.getReadingState
);

/**
 * @route   PUT /api/v1/books/:bookId/reading/progress
 * @desc    Update reading progress
 * @access  Private
 * @body    { currentChapter, currentPage, progressPercentage }
 */
bookRouter.put(
  '/:bookId/reading/progress',
  authMiddleware,
  readingController.updateReadingProgress
);

/**
 * @route   GET /api/v1/books/:bookId/chapters/:chapterNumber
 * @desc    Get chapter content
 * @access  Private
 */
bookRouter.get(
  '/:bookId/chapters/:chapterNumber',
  authMiddleware,
  readingController.getChapterContent
);

/**
 * @route   GET /api/v1/books/:bookId/chapters/:chapterNumber/pages/:pageNumber
 * @desc    Get page content
 * @access  Private
 */
bookRouter.get(
  '/:bookId/chapters/:chapterNumber/pages/:pageNumber',
  authMiddleware,
  readingController.getPageContent
);

/**
 * @route   GET /api/v1/books/:bookId/table-of-contents
 * @desc    Get book table of contents
 * @access  Private
 */
bookRouter.get(
  '/:bookId/table-of-contents',
  authMiddleware,
  readingController.getTableOfContents
);

// ============================================
// PART 7: BOOKMARKS & NOTES ROUTES
// ============================================

/**
 * @route   POST /api/v1/books/:bookId/bookmarks
 * @desc    Add bookmark
 * @access  Private
 * @body    { chapterNumber, pageNumber, note? }
 */
bookRouter.post(
  '/:bookId/bookmarks',
  authMiddleware,
  readingController.addBookmark
);

/**
 * @route   DELETE /api/v1/books/:bookId/bookmarks/:bookmarkId
 * @desc    Remove bookmark
 * @access  Private
 */
bookRouter.delete(
  '/:bookId/bookmarks/:bookmarkId',
  authMiddleware,
  readingController.removeBookmark
);

/**
 * @route   GET /api/v1/books/:bookId/bookmarks
 * @desc    Get all bookmarks for a book
 * @access  Private
 */
bookRouter.get(
  '/:bookId/bookmarks',
  authMiddleware,
  readingController.getBookmarks
);

/**
 * @route   GET /api/v1/books/:bookId/notes
 * @desc    Get all notes for a book
 * @access  Private
 */
bookRouter.get(
  '/:bookId/notes',
  authMiddleware,
  readingController.getNotes
);

/**
 * @route   POST /api/v1/books/:bookId/notes
 * @desc    Add note
 * @access  Private
 * @body    { chapterNumber, pageNumber?, note, highlight? }
 */
bookRouter.post(
  '/:bookId/notes',
  authMiddleware,
  readingController.addNote
);

/**
 * @route   PUT /api/v1/books/:bookId/notes/:noteId
 * @desc    Update note
 * @access  Private
 * @body    { note }
 */
bookRouter.put(
  '/:bookId/notes/:noteId',
  authMiddleware,
  readingController.updateNote
);

/**
 * @route   DELETE /api/v1/books/:bookId/notes/:noteId
 * @desc    Delete note
 * @access  Private
 */
bookRouter.delete(
  '/:bookId/notes/:noteId',
  authMiddleware,
  readingController.deleteNote
);

// ============================================
// PART 8: CHARACTERS & STATISTICS ROUTES
// ============================================

/**
 * @route   GET /api/v1/books/:bookId/characters
 * @desc    Get book characters
 * @access  Private
 */
bookRouter.get(
  '/:bookId/characters',
  authMiddleware,
  readingController.getCharacters
);

/**
 * @route   POST /api/v1/books/:bookId/characters/track-view
 * @desc    Track character view (for AI context)
 * @access  Private
 * @body    { characterName }
 */
bookRouter.post(
  '/:bookId/characters/track-view',
  authMiddleware,
  readingController.trackCharacterView
);

/**
 * @route   GET /api/v1/books/reading/statistics
 * @desc    Get user's reading statistics
 * @access  Private
 */
bookRouter.get(
  '/reading/statistics',
  authMiddleware,
  readingController.getReadingStatistics
);

export default bookRouter;
