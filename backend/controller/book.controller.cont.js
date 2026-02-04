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
  const { userId, bookId, currentChapter, currentPage, progressPercentage, maxSpoilerChapterAllowed } = req.body;

  try {
    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      {
        $set: {
          currentChapter,
          currentPage,
          progressPercentage,
          lastReadAt: new Date(),
          maxSpoilerChapterAllowed
        }
      },
      { new: true, upsert: true } // create if not exists
    );

    res.json({ success: true, state });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update reading progress" });
  }
};

export const addBookmark = async (req, res) => {
  const { userId, bookId, chapter, note, page } = req.body;

  try {
    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      {
        $push: { bookmarks: { chapter, note, page } },
        $set: { lastReadAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, state });
  } catch (err) {
    res.status(500).json({ error: "Failed to add bookmark" });
  }
};

export const addUserNote = async (req, res) => {
  const { userId, bookId, chapter, content, page } = req.body;

  try {
    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      {
        $push: { userNotes: { chapter, content, page } },
        $set: { lastReadAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, state });
  } catch (err) {
    res.status(500).json({ error: "Failed to add note" });
  }
};
