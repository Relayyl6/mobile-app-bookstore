// POST /update-reading-progress
// {
//   "userId": "u123",
//   "bookId": "b456",
//   "currentChapter": 5,
//   "currentPage": 123,
//   "progressPercentage": 37,
//   "maxSpoilerChapterAllowed": 5
// }

import userBookStateModel from "../models/userBookState.model.js";


export const updateReadingProgress = async (req, res) => {
  const { bookId, currentChapter, currentPage, progressPercentage } = req.body;
  const userId = req.user._id;

  try {
    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      {
        $set: {
          currentChapter,
          currentPage,
          progressPercentage,
          lastReadAt: new Date(),
        },
        $max: { maxSpoilerChapterAllowed: currentChapter } // 👈 prevents going backwards
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, state });
  } catch (err) {
    res.status(500).json({ error: "Failed to update reading progress" });
  }
};


export const addBookmark = async (req, res) => {
  const { bookId, chapter, page, note } = req.body;
  const userId = req.user._id;

  try {
    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      {
        $push: { bookmarks: { chapter, page, note } },
        $set: { lastReadAt: new Date() }
      },
      { new: true }
    );

    res.json({ success: true, bookmarks: state.bookmarks });
  } catch {
    res.status(500).json({ error: "Failed to add bookmark" });
  }
};


export const addUserNote = async (req, res) => {
  const { bookId, chapter, page, content } = req.body;
  const userId = req.user._id;

  try {
    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      {
        $push: { userNotes: { chapter, page, content } },
        $set: { lastReadAt: new Date() }
      },
      { new: true }
    );

    res.json({ success: true, notes: state.userNotes });
  } catch {
    res.status(500).json({ error: "Failed to add note" });
  }
};

/**
 * Get all bookmarks for a book
 */
export const getBookmarks = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next({ statusCode: 401, message: "Unauthorized" });
    }

    const state = await userBookStateModel.findOne({ userId, bookId }).lean();

    if (!state) {
      return res.status(200).json({
        success: true,
        message: "No reading state found for this book",
        bookmarks: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Bookmarks fetched successfully",
      bookmarks: state.bookmarks || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all notes for a book
 */
export const getNotes = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return next({ statusCode: 401, message: "Unauthorized" });
    }

    const state = await userBookStateModel.findOne({ userId, bookId }).lean();

    if (!state) {
      return res.status(200).json({
        success: true,
        message: "No reading state found for this book",
        notes: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      notes: state.userNotes || [],
    });
  } catch (error) {
    next(error);
  }
};
