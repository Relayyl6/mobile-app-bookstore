import { Schema, model, Types } from "mongoose";

const PageSchema = new Schema(
  {
    pageNumber: Number,
    text: String
  },
  { _id: false }
);

const ChapterSchema = new Schema(
  {
    chapterNumber: { type: Number, required: true },

    // 📖 Reader fields
    title: { type: String },
    content: { type: String }, // Full chapter text (simple version)

    pages: [PageSchema], // For Kindle-style pagination later

    // AI knowledge fields
    summary: { type: String },
    themes: [String],
    tone: { type: String },

    characters: [
      {
        name: String,
        role: String,
        description: String
      },
    ],

    embedding: {
      type: [Number], // semantic search vector
      default: [],
    },

    // // 🔒 Spoiler + system helpers
    // spoilerLevel: { type: Number, default: 0 }, // future-proofing
    // tokenCount: Number // helps with AI context limits
  },
  { _id: false }
);


const CharacterSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    relationships: String,

    embedding: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

const BookKnowledgeSchema = new Schema(
  {
    bookId: {
      type: Types.ObjectId,
      ref: "Book",
      required: true,
      unique: true, // one knowledge doc per book
    },

    fileUrl: String, // original uploaded file location (PDF/EPUB/etc)

    metadata: {
      title: String,
      author: String,
      genre: [String],
      publishedYear: Number,
      language: String,
    },

    uploader: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },  

    overview: {
      summary: String,
      majorThemes: [String],
      tone: String,
      embedding: [Number],
    },

    chapters: [ChapterSchema],

    characters: [CharacterSchema],
  },
  { timestamps: true }
);

const bookKnowledgeModel = model("BookKnowledge", BookKnowledgeSchema);

export default bookKnowledgeModel;
