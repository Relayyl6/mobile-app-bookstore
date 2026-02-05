import { Schema, model, Types } from "mongoose";

const BookmarkSchema = new Schema(
  {
    chapter: { type: Number, default: 1 },
    page: { type: Number, default: 1 },
    note: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserNoteSchema = new Schema(
  {
    chapter: { type: Number, default: 1 },
    page: { type: Number, default: 1 },
    content: { type: String, default: "" },
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

    currentChapter: { type: Number, default: 1, min: 1 },
    currentPage: { type: Number, default: 1, min: 1 },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },

    lastReadAt: { type: Date, default: Date.now },

    recentCharactersViewed: {
      type: [String],
      default: [],
    },

    bookmarks: {
      type: [BookmarkSchema],
      default: [],
    },

    userNotes: {
      type: [UserNoteSchema],
      default: [],
    },

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

UserBookStateSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default model("UserBookState", UserBookStateSchema);
