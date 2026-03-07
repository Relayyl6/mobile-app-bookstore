// ============================================
// READING CONTROLLER
// Manages user reading progress and state
// ============================================

import mongoose from "mongoose";
import bookKnowledgeModel from "../models/knowledge.model.js";
import userBookStateModel from "../models/userBookState.model.js";
import bookModel from "../models/book.model.js";

/**
 * Get reading content for a specific chapter
 */
export const getChapterContent = async (req, res, next) => {
  try {
    const { bookId, chapterNumber } = req.params;
    const userId = req.user._id;

    // Get book knowledge
    const knowledge = await bookKnowledgeModel.findOne({ bookId }).lean();
    
    if (!knowledge) {
      return next({
        statusCode: 404,
        message: "Book content not found"
      });
    }

    // Find the chapter
    const chapter = knowledge.chapters.find(
      ch => ch.chapterNumber === parseInt(chapterNumber)
    );

    if (!chapter) {
      return next({
        statusCode: 404,
        message: "Chapter not found"
      });
    }

    // Get user's reading state
    let state = await userBookStateModel.findOne({ userId, bookId });
    
    if (!state) {
      // Create initial state
      state = await userBookStateModel.create({
        userId,
        bookId,
        currentChapter: 1,
        currentPage: 1,
        progressPercentage: 0,
        lastReadAt: new Date(),
        maxSpoilerChapterAllowed: 1
      });
    }

    // Check if user has access to this chapter (spoiler protection)
    if (parseInt(chapterNumber) > state.maxSpoilerChapterAllowed) {
      return next({
        statusCode: 403,
        message: `You can only read up to chapter ${state.maxSpoilerChapterAllowed}. Continue reading to unlock more!`
      });
    }

    if (parseInt(chapterNumber) >= state.maxSpoilerChapterAllowed) {
      await userBookStateModel.updateOne(
        { userId, bookId },
        { $set: { maxSpoilerChapterAllowed: parseInt(chapterNumber) + 1 } }
      );
    }

    // Update last read time
    await userBookStateModel.updateOne(
      { userId, bookId },
      { $set: { lastReadAt: new Date() } }
    );

    res.json({
      success: true,
      chapter: {
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        content: chapter.content,
        pages: chapter.pages,
        summary: chapter.summary,
        themes: chapter.themes,
        tone: chapter.tone,
        characters: chapter.characters
      },
      userProgress: {
        currentChapter: state.currentChapter,
        currentPage: state.currentPage,
        maxUnlockedChapter: state.maxSpoilerChapterAllowed
      }
    });

  } catch (err) {
    console.error("Error getting chapter content:", err);
    next(err);
  }
};

/**
 * Get specific page content from a chapter
 */
export const getPageContent = async (req, res, next) => {
  try {
    const { bookId, chapterNumber, pageNumber } = req.params;
    const userId = req.user._id;

    const knowledge = await bookKnowledgeModel.findOne({ bookId }).lean();
    
    if (!knowledge) {
      return next({
        statusCode: 404,
        message: "Book content not found"
      });
    }

    const chapter = knowledge.chapters.find(
      ch => ch.chapterNumber === parseInt(chapterNumber)
    );

    if (!chapter) {
      return next({
        statusCode: 404,
        message: "Chapter not found"
      });
    }

    const page = chapter.pages[parseInt(pageNumber) - 1];

    if (!page) {
      return next({
        statusCode: 404,
        message: "Page not found"
      });
    }

    // Get reading state
    const state = await userBookStateModel.findOne({ userId, bookId });

    res.json({
      success: true,
      page: {
        chapterNumber: parseInt(chapterNumber),
        pageNumber: parseInt(pageNumber),
        content: page,
        totalPagesInChapter: chapter.pages.length
      },
      userProgress: {
        currentChapter: state?.currentChapter,
        currentPage: state?.currentPage
      }
    });

  } catch (err) {
    console.error("Error getting page content:", err);
    next(err);
  }
};

/**
 * Update reading progress
 */
export const updateReadingProgress = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { currentChapter, currentPage, progressPercentage } = req.body;

    // Get book knowledge to calculate max allowed chapter
    const knowledge = await bookKnowledgeModel.findOne({ bookId }).lean();
    
    if (!knowledge) {
      return next({
        statusCode: 404,
        message: "Book not found"
      });
    }

    const totalChapters = knowledge.chapters.length;

    // Calculate new max spoiler chapter (can only increase, not decrease)
    const currentState = await userBookStateModel.findOne({ userId, bookId });

    const updateData = {
      currentChapter,
      currentPage,
      progressPercentage: progressPercentage || Math.round((currentChapter / totalChapters) * 100),
      lastReadAt: new Date(),
      // Never decrease maxSpoilerChapterAllowed, and always unlock next chapter
      maxSpoilerChapterAllowed: Math.max(
        currentState?.maxSpoilerChapterAllowed || 1,
        currentChapter + 1  // unlock next chapter
      )
    };

    // Update max spoiler chapter if user progressed further
    if (!currentState || currentChapter > currentState.maxSpoilerChapterAllowed) {
      updateData.maxSpoilerChapterAllowed = currentChapter + 1;
    }

    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Reading progress updated",
      progress: {
        currentChapter: state.currentChapter,
        currentPage: state.currentPage,
        progressPercentage: state.progressPercentage,
        maxUnlockedChapter: state.maxSpoilerChapterAllowed,
        lastReadAt: state.lastReadAt
      }
    });

  } catch (err) {
    console.error("Error updating reading progress:", err);
    next(err);
  }
};

/**
 * Get user's reading state for a book
 */
export const getReadingState = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const state = await userBookStateModel.findOne({ userId, bookId }).lean();

    if (!state) {
      return res.json({
        success: true,
        state: null,
        message: "No reading progress yet"
      });
    }

    res.json({
      success: true,
      state: {
        currentChapter: state.currentChapter,
        currentPage: state.currentPage,
        progressPercentage: state.progressPercentage,
        lastReadAt: state.lastReadAt,
        maxUnlockedChapter: state.maxSpoilerChapterAllowed,
        bookmarks: state.bookmarks,
        notes: state.userNotes,
        recentCharacters: state.recentCharactersViewed
      }
    });

  } catch (err) {
    console.error("Error getting reading state:", err);
    next(err);
  }
};

/**
 * Add bookmark
 */
export const addBookmark = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { chapterNumber, pageNumber, note } = req.body;

    if (!chapterNumber || !pageNumber) {
      return next({
        statusCode: 400,
        message: "chapterNumber and pageNumber are required"
      });
    }

    const bookmark = {
      chapterNumber,
      pageNumber,
      note: note || "",
      createdAt: new Date()
    };

    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      { 
        $push: { bookmarks: bookmark },
        $set: { lastReadAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Bookmark added",
      bookmarks: state.bookmarks
    });

  } catch (err) {
    console.error("Error adding bookmark:", err);
    next(err);
  }
};

/**
 * Remove bookmark
 */
export const removeBookmark = async (req, res, next) => {
  try {
    const { bookId, bookmarkId } = req.params;
    const userId = req.user._id;

    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      { 
        $pull: { bookmarks: { _id: bookmarkId } }
      },
      { new: true }
    );

    if (!state) {
      return next({
        statusCode: 404,
        message: "Reading state not found"
      });
    }

    res.json({
      success: true,
      message: "Bookmark removed",
      bookmarks: state.bookmarks
    });

  } catch (err) {
    console.error("Error removing bookmark:", err);
    next(err);
  }
};

/**
 * Add note
 */
export const addNote = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { chapterNumber, pageNumber, note, highlight } = req.body;

    if (!chapterNumber || !note) {
      return next({
        statusCode: 400,
        message: "chapterNumber and note are required"
      });
    }

    const noteObj = {
      chapterNumber,
      pageNumber: pageNumber || null,
      note,
      highlight: highlight || "",
      createdAt: new Date()
    };

    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      { 
        $push: { userNotes: noteObj },
        $set: { lastReadAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Note added",
      notes: state.userNotes
    });

  } catch (err) {
    console.error("Error adding note:", err);
    next(err);
  }
};

/**
 * Update note
 */
export const updateNote = async (req, res, next) => {
  try {
    const { bookId, noteId } = req.params;
    const userId = req.user._id;
    const { note } = req.body;

    if (!note) {
      return next({
        statusCode: 400,
        message: "note is required"
      });
    }

    const state = await userBookStateModel.findOneAndUpdate(
      { 
        userId, 
        bookId,
        "userNotes._id": noteId
      },
      { 
        $set: { "userNotes.$.note": note }
      },
      { new: true }
    );

    if (!state) {
      return next({
        statusCode: 404,
        message: "Note not found"
      });
    }

    res.json({
      success: true,
      message: "Note updated",
      notes: state.userNotes
    });

  } catch (err) {
    console.error("Error updating note:", err);
    next(err);
  }
};

/**
 * Delete note
 */
export const deleteNote = async (req, res, next) => {
  try {
    const { bookId, noteId } = req.params;
    const userId = req.user._id;

    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      { 
        $pull: { userNotes: { _id: noteId } }
      },
      { new: true }
    );

    if (!state) {
      return next({
        statusCode: 404,
        message: "Reading state not found"
      });
    }

    res.json({
      success: true,
      message: "Note deleted",
      notes: state.userNotes
    });

  } catch (err) {
    console.error("Error deleting note:", err);
    next(err);
  }
};

/**
 * Get book table of contents
 */
export const getTableOfContents = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const knowledge = await bookKnowledgeModel.findOne({ bookId })
      .select('chapters.chapterNumber chapters.title chapters.themes')
      .lean();

    if (!knowledge) {
      return next({
        statusCode: 404,
        message: "Book content not found"
      });
    }

    // Get user's progress
    const state = await userBookStateModel.findOne({ userId, bookId }).lean();

    const tableOfContents = knowledge.chapters.map(ch => ({
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      themes: ch.themes,
      isUnlocked: !state || ch.chapterNumber <= state.maxSpoilerChapterAllowed,
      isCurrentChapter: state && ch.chapterNumber === state.currentChapter
    }));

    res.json({
      success: true,
      tableOfContents,
      userProgress: state ? {
        currentChapter: state.currentChapter,
        maxUnlockedChapter: state.maxSpoilerChapterAllowed
      } : null
    });

  } catch (err) {
    console.error("Error getting table of contents:", err);
    next(err);
  }
};

/**
 * Get character list for a book
 */
export const getCharacters = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const knowledge = await bookKnowledgeModel.findOne({ bookId })
      .select('characters')
      .lean();

    if (!knowledge) {
      return next({
        statusCode: 404,
        message: "Book content not found"
      });
    }

    // Get user's state to track viewed characters
    const state = await userBookStateModel.findOne({ userId, bookId });

    res.json({
      success: true,
      characters: knowledge.characters.map(c => ({
        name: c.name,
        description: c.description,
        relationships: c.relationships
      })),
      recentlyViewed: state?.recentCharactersViewed || []
    });

  } catch (err) {
    console.error("Error getting characters:", err);
    next(err);
  }
};

/**
 * Track character view (for AI context)
 */
export const trackCharacterView = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { characterName } = req.body;

    if (!characterName) {
      return next({
        statusCode: 400,
        message: "characterName is required"
      });
    }

    // Add to recent characters (keep last 5)
    await userBookStateModel.updateOne(
      { userId, bookId },
      { 
        $push: { 
          recentCharactersViewed: {
            $each: [characterName],
            $position: 0,
            $slice: 5
          }
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Character view tracked"
    });

  } catch (err) {
    console.error("Error tracking character view:", err);
    next(err);
  }
};

/**
 * Get reading statistics
 */
export const getReadingStatistics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all user's reading states
    const states = await userBookStateModel.find({ userId })
      .populate('bookId', 'title author image')
      .lean();

    // Calculate statistics
    const totalBooksStarted = states.length;
    const booksInProgress = states.filter(s => 
      s.progressPercentage > 0 && s.progressPercentage < 100
    ).length;
    const booksCompleted = states.filter(s => 
      s.progressPercentage === 100
    ).length;

    // Total reading time (approximate based on progress)
    const totalProgress = states.reduce((sum, s) => sum + s.progressPercentage, 0);

    // Recently read books
    const recentlyRead = states
      .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
      .slice(0, 5)
      .map(s => ({
        bookId: s.bookId._id,
        title: s.bookId.title,
        author: s.bookId.author,
        coverImage: s.bookId.image,
        progress: s.progressPercentage,
        lastReadAt: s.lastReadAt
      }));

    res.json({
      success: true,
      statistics: {
        totalBooksStarted,
        booksInProgress,
        booksCompleted,
        averageProgress: totalBooksStarted > 0 
          ? Math.round(totalProgress / totalBooksStarted) 
          : 0,
        recentlyRead
      }
    });

  } catch (err) {
    console.error("Error getting reading statistics:", err);
    next(err);
  }
};

export default {
  getChapterContent,
  getPageContent,
  updateReadingProgress,
  getReadingState,
  addBookmark,
  removeBookmark,
  addNote,
  updateNote,
  deleteNote,
  getTableOfContents,
  getCharacters,
  trackCharacterView,
  getReadingStatistics
};