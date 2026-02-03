import { Schema, model, Types } from "mongoose";

const BookmarkSchema = new Schema(
  {
    chapter: Number,
    page: Number,
    note: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserNoteSchema = new Schema(
  {
    chapter: Number,
    page: Number,
    content: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserBookStateSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    bookId: {
      type: Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    currentChapter: {
      type: Number,
      default: 1,
      min: 1,
    },

    currentPage: {
      type: Number,
      default: 1,
      min: 1,
    },

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    lastReadAt: {
      type: Date,
      default: Date.now,
    },

    recentCharactersViewed: [
      {
        type: String, // character names (fast lookup for AI context)
      },
    ],

    bookmarks: [BookmarkSchema],

    userNotes: [UserNoteSchema],

    tonePreferenceForAI: {
      type: String,
      enum: ["friendly", "formal", "funny", "dramatic", "neutral"],
      default: "friendly",
    },

    maxSpoilerChapterAllowed: {
      type: Number,
      default: 1,
      min: 1,
    },

    lastAIInteractionSummary: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// 🚀 Prevent duplicate state per user per book
UserBookStateSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const userBookStateModel = model("UserBookState", UserBookStateSchema);

export default userBookStateModel
