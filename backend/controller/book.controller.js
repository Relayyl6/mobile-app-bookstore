// ============================================
// REFACTORED BOOK CONTROLLER
// Clean separation of concerns
// ============================================

import { GEMINI_API_KEY } from "../config/env.js";
import cloudinary from "../lib/cloudinary.js";
import { autoUpdatePreferences } from "../lib/utils.js";
import bookModel from "../models/book.model.js";
import interactionModel from "../models/interaction.model.js";
import RatingModel from "../models/rating.model.js";
import recommendationService from "../services/recommendation.service.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import uploadToCloudinary, {
  embedText,
  searchBookContent,
  analyzePdfWithGemini,
  extractPdfInfo,
  extractPdfText,
  isTextExtractionUsable,
  splitIntoChapters,
  splitChapterIntoPages,
  analyzeExtractedTextWithGemini,
  cleanExtractedText
} from '../lib/tools.js';
import bookKnowledgeModel from "../models/knowledge.model.js";
import userBookStateModel from "../models/userBookState.model.js";
import mongoose, { Types } from "mongoose";
import path from 'path';
import os from 'os';
import fs from 'fs';
import { PDFParse } from "pdf-parse";

export const createBook = async (req, res, next) => {
  try {
    console.log("=== CREATE BOOK START ===");
    
    const userId = req.user?._id;
    console.log("User ID:", userId);

    if (!userId) {
      console.log("Unauthorized: No user ID");
      return next({ statusCode: 401, message: "Unauthorized" });
    }

    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));
    console.log("REQ USER:", JSON.stringify(req.user, null, 2));

    const {
      title,
      subTitle,
      author,
      caption,
      description,
      genres,
      price,
      isbn,
      publishedYear,
      visibility = "public"
    } = req.body;

    console.log("Parsed fields:", {
      title,
      subTitle,
      author,
      caption,
      description,
      genres,
      price,
      isbn,
      publishedYear,
      visibility
    });

    // Validate required fields
    const missing = [
      !title && "title",
      !author && "author",
      !caption && "caption",
      !genres && "genres",
      // !image && "image",
      !price && "price",
    ].filter(Boolean);

    console.log("Missing fields:", missing);

    if (missing.length > 0) {
      const formatter = new Intl.ListFormat("en", {
        style: "long",
        type: "conjunction",
      });
      const message = `${formatter.format(missing)} ${missing.length > 1 ? "are" : "is"} missing`;
      console.log("Validation error:", message);
      return next({ statusCode: 400, message });
    }

    // Check uniqueness
    console.log("Checking for existing book with same title or ISBN...");
    const uniquenessQuery = [{ title }];
    if (isbn) uniquenessQuery.push({ isbn });
    const existingBook = await bookModel.findOne({ $or: uniquenessQuery });
    console.log("Existing book found:", existingBook);

    if (existingBook) {
      console.log("Book with same title or ISBN exists");
      return next({
        statusCode: 400,
        message: "Book with same title or ISBN already exists"
      });
    }

    let coverImageUrl = "";
    if (req.body.image) {
      console.log("Uploading image to Cloudinary...");
      const uploadResponse = await cloudinary.uploader.upload(req.body.image, { resource_type: "image" });
      console.log("Upload response:", JSON.stringify(uploadResponse, null, 2));
      coverImageUrl = uploadResponse.secure_url;
    }

    // Create book metadata
    console.log("Creating book in database...");
    const book = await bookModel.create({
      title,
      subTitle,
      author,
      isbn,
      caption,
      description,
      genres,
      image: coverImageUrl,
      price,
      publishedYear,
      visibility,
      user: userId,

      // Recommendation metrics
      averageRating: 0,
      totalRatings: 0,
      totalViews: 0,
      totalPurchases: 0,
      
      // Content status
      hasContent: false, // Will be true after PDF upload
    });

    console.log("Book created:", JSON.stringify(book, null, 2));

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      book: {
        id: book._id,
        ...book.toObject()
      }
    });

    console.log("=== CREATE BOOK END ===");
  } catch (error) {
    console.log("ERROR CAUGHT:", JSON.stringify(error, null, 2));

    if (error.http_code) {
      console.log("Cloudinary upload error:", error);
      return next({
        statusCode: error.http_code,
        message: error.message?.message || "Image upload failed"
      });
    }

    return next(error);
  }
};

/**
 * Update book metadata (catalog info)
 */
export const updateBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return next({ statusCode: 401, message: "Unauthorized" });
    }

    const allowedFields = [
      "title",
      "subTitle",
      "author",
      "caption",
      "description",
      "genres",
      "price",
      "isbn",
      "publishedYear",
      "visibility",
    ];

    const updateFields = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }

    // Handle image update
    if (req.body.image) {
      const uploadResponse = await cloudinary.uploader.upload(req.body.image);
      updateFields.image = uploadResponse.secure_url;
    }

    const book = await bookModel.findOneAndUpdate(
      { _id: bookId, user: userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!book) {
      return next({
        statusCode: 404,
        message: "Book not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete book from catalog
 */
export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const book = await bookModel.findById(id);

    if (!book) {
      return next({ statusCode: 404, message: "Book not found" });
    }

    if (book.user.toString() !== userId.toString()) {
      console.log("🔴 Sending 401 to middleware:", { statusCode: 401, message: "Unauthorized. Cannot delete what you didnt upload" });
      return next({ statusCode: 401, message: "Unauthorized. Cannot delete what you didnt upload" });
    }

    // Delete cover image from Cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      const publicId = book.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete book knowledge if exists
    await bookKnowledgeModel.findOneAndDelete({ bookId: book._id });

    // Delete user states
    await userBookStateModel.deleteMany({ bookId: book._id });

    // Delete book
    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: "Book deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated books for marketplace/catalog
 */
export const getBooks = async (req, res, next) => {
  try {
    if (!req.user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    console.log("getBooks called, user:", req.user._id)
    console.log("instead, request contains id")
    
    const totalInDB = await bookModel.countDocuments({})
    console.log("Total books in DB (no filter):", totalInDB)
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const userId = req.user._id;
    const visibilityQuery = {
      $or: [
        { visibility: 'public' },
        { visibility: { $exists: false } }, // books saved before visibility was added
        { visibility: null },
        ...(userId ? [{ user: userId }] : []),
      ],
    };

    console.log("Visibility query:", JSON.stringify(visibilityQuery))
    const matchingCount = await bookModel.countDocuments(visibilityQuery)
    console.log("Books matching visibility query:", matchingCount)

    const books = await bookModel
      .find(visibilityQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage")
      .lean();

    const totalBooks = await bookModel.countDocuments(visibilityQuery);

    res.status(200).json({
      success: true,
      message: "Books fetched successfully",
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single book details (catalog + reading info if available)
 */
export const getSingleBook = async (req, res, next) => {
  try {
    console.log("🔍 [1] getSingleBook triggered for ID:", req.params.id);
    const { id } = req.params;
    const userId = req.user._id;

    console.log("👤 [2] User ID extracted:", userId);

    if (!userId) {
      console.log("❌ [Error] Unauthorized access attempt.");
      return next({ statusCode: 401, message: "Unauthorized" });
    }

    console.log("📚 [3] Fetching book metadata...");
    const book = await bookModel.findById(id)
      .populate("user", "username profileImage")
      .lean();

    console.log("✅ [4] Book fetched successfully? :", !!book);

    if (!book) {
      return next({ statusCode: 404, message: "Book not found" });
    }

    console.log("🧠 [5] Fetching AI knowledge...");
    const knowledge = await bookKnowledgeModel.findOne({ bookId: id }).lean();
    console.log("✅ [6] AI Knowledge found? :", !!knowledge);

    console.log("📖 [7] Fetching reading state...");
    const state = await userBookStateModel.findOne({ userId, bookId: id }).lean();
    console.log("✅ [8] Reading state found? :", !!state);

    console.log("🧮 [9] Calculating total pages...");
    const totalPages = knowledge?.chapters?.reduce(
      (sum, ch) => sum + (ch?.pages?.length || 0), // Added safety ? to pages just in case
      0
    ) || 0;
    console.log("✅ [10] Total pages calculated:", totalPages);

    console.log("🏗️ [11] Assembling response payload...");
    
    // I moved the payload to a variable first so we can log if it successfully builds
    const responsePayload = {
      success: true,
      book: {
        // Basic metadata
        id: book._id,
        title: book.title,
        subTitle: book.subTitle,
        author: book.author,
        isbn: book.isbn,
        caption: book.caption,
        description: book.description,
        genres: book.genres,
        coverImage: book.image,
        price: book.price,
        publishedYear: book.publishedYear,

        // Stats
        averageRating: book.averageRating || 0,
        totalRatings: book.totalRatings || 0,
        totalViews: book.totalViews || 0,
        totalPurchases: book.totalPurchases || 0,

        // Content availability
        hasContent: book.hasContent,
        visibility: book.visibility || 'public',
        totalPages,

        // AI knowledge (if available)
        aiKnowledge: knowledge ? {
          summary: knowledge.overview?.summary,
          majorThemes: knowledge.overview?.majorThemes,
          tone: knowledge.overview?.tone,
          // Added a safe map in case the database array has a null element
          characters: knowledge.characters?.map(c => {
            if (!c) return null; 
            return {
              name: c.name,
              description: c.description,
              role: c.relationships
            }
          }).filter(Boolean) // This removes any nulls from the final array
        } : null,

        // User's reading progress (if exists)
        readingProgress: state ? {
          currentChapter: state.currentChapter,
          currentPage: state.currentPage,
          progressPercentage: state.progressPercentage,
          lastReadAt: state.lastReadAt,
          bookmarks: state.bookmarks,
          notes: state.userNotes
        } : null,

        // Uploader info
        uploader: {
          username: book.user?.username || "Unknown User",
          profileImage: book.user?.profileImage || null
        }
      }
    };

    console.log("🚀 [12] Payload assembled without crashing! Sending response...");
    res.status(200).json(responsePayload);

  } catch (error) {
    // THIS IS THE MOST IMPORTANT PART
    console.error("🔥 [CRITICAL BACKEND ERROR]:", error.message);
    console.error("🥞 Stack Trace:");
    console.error(error.stack); 
    
    next(error);
  }
};

// ============================================
// PART 2: CONTENT MANAGEMENT (PDF UPLOAD)
// This handles the actual book content
// ============================================

/**
 * Upload PDF content for an existing book
 * This creates the AI knowledge and reading content
 */
export const uploadBookContent = async (req, res, next) => {
  console.log("🟢 [UPLOAD] Starting PDF upload process");

  try {
    console.log("📥 Incoming request body:", JSON.stringify(req.body));
    console.log("📥 Incoming file info:", req.file ? req.file.originalname : "No file");

    if (!req.file) {
      return next({ statusCode: 400, message: "No file uploaded" });
    }

    const userId = req.user?._id;
    const { bookId } = req.body;

    console.log("👤 User ID:", userId);
    console.log("📚 Book ID from body:", bookId);

    if (!bookId) {
      return next({ statusCode: 400, message: "bookId is required" });
    }

    const book = await bookModel.findById(bookId);
    console.log("📖 Fetched book from DB:", JSON.stringify(book));

    if (!book) {
      return next({ statusCode: 404, message: "Book not found" });
    }

    if (book.user.toString() !== userId.toString()) {
      return next({ statusCode: 403, message: "Not authorized to upload content for this book" });
    }

    const existingKnowledge = await bookKnowledgeModel.findOne({ bookId });
    console.log("🔍 Existing knowledge already exist ", existingKnowledge ? "YES" : "NO");

    if (existingKnowledge) {
      return next({ statusCode: 400, message: "Content already uploaded for this book" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 1. Upload PDF to Cloudinary
    console.log("☁️ [UPLOAD] Uploading to Cloudinary...");
    let fileUrl;
    try {
      fileUrl = await uploadToCloudinary(req.file.buffer, "raw");
      console.log("✅ [UPLOAD] Upload complete. File URL:", fileUrl);
    } catch (cloudinaryErr) {
      console.error("🔥 [UPLOAD] Cloudinary upload failed:", cloudinaryErr);

      // Handle Cloudinary timeout (499)
      if (cloudinaryErr?.http_code === 499 || cloudinaryErr?.name === "TimeoutError" || cloudinaryErr?.message === "Request Timeout") {
        return next({ statusCode: 408, message: "File upload timed out. Please try again with a smaller file or check your connection." });
      }

      // Handle file too large
      if (cloudinaryErr?.http_code === 413) {
        return next({ statusCode: 413, message: "File is too large to upload. Please use a smaller PDF." });
      }

      return next({ statusCode: 502, message: "Failed to upload file to storage. Please try again." });
    }

    console.log("📄 [UPLOAD] Extracting PDF text...");
    let pdfText = "";
    let chaptersWithContent = [];
    let textExtractionWorked = false;
    let rawPdfText = "";

    try {
      
      rawPdfText = await extractPdfText(fileUrl);
      pdfText = cleanExtractedText(rawPdfText);
      textExtractionWorked = isTextExtractionUsable(pdfText);

      if (textExtractionWorked) {

        chaptersWithContent = splitIntoChapters(pdfText);
        console.log(`✅ [UPLOAD] Text extracted: ${pdfText.length} chars, ${chaptersWithContent.length} chapters`);
      } else {
        console.warn("⚠️ [UPLOAD] PDF text too short — likely a scanned PDF. Will use Gemini content only.");
      }
    } catch (textErr) {
      console.warn("⚠️ [UPLOAD] PDF text extraction failed, continuing without it:", textErr.message);
    }

    // 2. Analyze PDF with Gemini
    console.log("🤖 [UPLOAD] Sending PDF to Gemini for analysis...");
    let analysis;
    try {
      if (textExtractionWorked && pdfText.length > 0) {
        // Use extracted text — avoids RECITATION entirely
        analysis = await analyzeExtractedTextWithGemini(model, pdfText, chaptersWithContent);
      } else {
        // Fallback to PDF file upload for scanned docs
        analysis = await analyzePdfWithGemini(model, fileUrl);
      }
      // console.log("📊 Analysis:", JSON.stringify(analysis));
    } catch (geminiErr) {
      console.error("🔥 [UPLOAD] Gemini analysis failed:", geminiErr);

      // Rate limit / quota exceeded
      if (geminiErr?.status === 429) {
        const retryAfter = geminiErr?.errorDetails?.find(d => d.retryDelay)?.retryDelay || "a few minutes";
        return next({ statusCode: 429, message: `AI analysis quota exceeded. Please try again in ${retryAfter}.` });
      }

      // Gemini file processing failed
      if (geminiErr?.status === 404) {
        return next({ statusCode: 422, message: "Could not process the PDF file. Ensure it is a valid, non-corrupted PDF." });
      }

      // Gemini server error
      if (geminiErr?.status >= 500) {
        return next({ statusCode: 503, message: "AI service is temporarily unavailable. Please try again later." });
      }

      if (geminiErr?.code === "ETIMEDOUT" || geminiErr?.cause?.code === "ETIMEDOUT") {
        return next({ statusCode: 408, message: "Connection timed out while preparing your PDF for analysis. Please try again." });
      }

      // Gemini timeout
      if (geminiErr?.name === "TimeoutError" || geminiErr?.message?.includes("timeout")) {
        return next({ statusCode: 408, message: "AI analysis timed out. Your PDF may be too large or complex. Please try again." });
      }

      if (geminiErr?.message?.includes("RECITATION")) {
        return next({ 
          statusCode: 422, 
          message: "AI analysis was blocked for this PDF. This usually happens with published copyrighted works. The book was uploaded but content analysis could not be completed." 
        });
      }

      return next({ statusCode: 500, message: "Failed to analyze PDF content. Please try again." });
    }

    const pdfInfo = analysis.info;
    const bookOverview = analysis.overview;

    // 3. Structure chapters
    const structuredChapters = (() => {
    // analyzeExtractedTextWithGemini already merges content+pages inside it
    // so analysis.chapters already has everything we need
    if (textExtractionWorked && chaptersWithContent.length > 0) {
      return analysis.chapters.map((ch) => ({
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        content: ch.content,                                          // ✅ real pdf-parse text, merged inside analyzeExtractedTextWithGemini
        pages: ch.pages,                                              // ✅ real paginated pages, regenerated from actual content
        wordCount: ch.wordCount || ch.content?.split(/\s+/).length || 0,
        summary: ch.summary || "",
        themes: ch.themes || [],
        tone: ch.tone || "",
        setting: ch.setting || "",
        characters: (ch.characters || []).map(c => ({
          name: c.name || "",
          role: c.role || "",
          description: c.description || ""
        })),
        narrativeSignificance: ch.narrativeSignificance || "",
        startMarker: ch.startMarker || "",
        endMarker: ch.endMarker || "",
        embedding: []
      }));
    } else {
      // Fallback — analyzePdfWithGemini (scanned PDF)
      // No real text available so we use whatever Gemini returned
      return analysis.chapters.map((ch) => ({
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        content: ch.content || "",                                    // Gemini transcribed or empty
        pages: ch.content ? splitChapterIntoPages(ch.content) : [],  // paginate Gemini's content if available
        wordCount: ch.content?.split(/\s+/).length || 0,
        summary: ch.summary || "",
        themes: ch.themes || [],
        tone: ch.tone || "",
        setting: ch.setting || "",
        characters: (ch.characters || []).map(c => ({
          name: c.name || "",
          role: c.role || "",
          description: c.description || ""
        })),
        narrativeSignificance: ch.narrativeSignificance || "",
        startMarker: ch.startMarker || "",
        endMarker: ch.endMarker || "",
        embedding: []
      }));
    }
  })();

  // console.log("📚 Structured Chapters sample:", JSON.stringify({
  //   ...structuredChapters[0],
  //   content: structuredChapters[0]?.content
  //     ? structuredChapters[0].content.substring(0, 150) + "..."
  //     : "[no content]",
  //   pages: `${structuredChapters[0]?.pages?.length || 0} pages`
  // }));

    // 4. Structure characters
    const structuredCharacters = bookOverview.mainCharacters.map(c => ({
      name: c.name,
      description: c.description,
      relationships: c.relationships || "",
      embedding: []
    }));
    // console.log("👥 Structured Characters:", JSON.stringify(structuredCharacters[0] || {}));

    // 5. Save to database
    console.log("💾 [UPLOAD] Saving to database...");
    let savedKnowledge;
    try {
      savedKnowledge = await bookKnowledgeModel.create({
        bookId,
        fileUrl,
        metadata: {
          title: pdfInfo.title || book.title,
          author: pdfInfo.author || book.author,
          genre: pdfInfo.genre || book.genres,
          publishedYear: pdfInfo.publishedYear || book.publishedYear,
          language: pdfInfo.language,
        },
        uploader: userId,
        overview: {
          summary: bookOverview.summary,
          majorThemes: bookOverview.majorThemes,
          tone: bookOverview.tone,
          embedding: []
        },
        chapters: structuredChapters,
        characters: structuredCharacters
      });
      // console.log("✅ Knowledge saved:", JSON.stringify(savedKnowledge));
    } catch (dbErr) {
      console.error("🔥 [UPLOAD] Database save failed:", dbErr);

      if (dbErr.name === "ValidationError") {
        return next({ statusCode: 422, message: `Validation error: ${Object.values(dbErr.errors).map(e => e.message).join(", ")}` });
      }

      if (dbErr.code === 11000) {
        return next({ statusCode: 400, message: "Content already exists for this book." });
      }

      return next({ statusCode: 500, message: "Failed to save book content to database." });
    }

    // 6. Generate embeddings (non-fatal — we don't fail the whole upload if this fails)
    console.log("🔢 [UPLOAD] Generating embeddings...");
    for (const ch of structuredChapters) {
      try {
        console.log(`🔹 Generating embedding for chapter ${ch.chapterNumber}`);
        const embedding = await embedText(genAI, ch.summary);
        await bookKnowledgeModel.updateOne(
          { bookId, "chapters.chapterNumber": ch.chapterNumber },
          { $set: { "chapters.$.embedding": embedding } }
        );
      } catch (embedErr) {
        console.warn(`⚠️ Embedding failed for chapter ${ch.chapterNumber}:`, embedErr.message);
        // Don't fail — just skip, embeddings can be backfilled later
      }
    }

    for (const char of structuredCharacters) {
      try {
        console.log(`🔹 Generating embedding for character ${char.name}`);
        const embedding = await embedText(genAI, char.description);
        await bookKnowledgeModel.updateOne(
          { bookId, "characters.name": char.name },
          { $set: { "characters.$.embedding": embedding } }
        );
      } catch (embedErr) {
        console.warn(`⚠️ Embedding failed for character ${char.name}:`, embedErr.message);
      }
    }

    // 7. Update book metadata
    console.log("📌 Updating book metadata...");
    try {
      await bookModel.findByIdAndUpdate(bookId, { hasContent: true });
    } catch (updateErr) {
      // Non-fatal — book is saved, just flag didn't update
      console.warn("⚠️ Failed to update book hasContent flag:", updateErr.message);
    }

    console.log("🎉 [UPLOAD] Upload complete");
    res.status(200).json({
      success: true,
      message: "Book content uploaded and processed successfully",
      data: {
        bookId,
        totalChapters: structuredChapters.length,
        totalCharacters: structuredCharacters.length,
        summary: bookOverview.summary,
        totalPages: pdfInfo.totalPages || 0,
        totalWords: pdfInfo.totalWords || 0,
        structureType: pdfInfo.structureType || "unknown",
        setting: bookOverview.setting || "",
      }
    });

  } catch (error) {
    console.error("🔥 [UPLOAD] Unhandled error:", error, "\nStack:", error.stack);
    next({ statusCode: 500, message: error.message || "An unexpected error occurred during upload." });
  }
};

// ask question regarding the book
export const askBookQuestion = async (req, res, next) => {
  try {
    // const { bookId, question } = req.body;
    const question = req.query.question;
    const bookId = req.query.id

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 1. Find relevant chapters using embeddings
    const relevant = await searchBookContent(genAI, bookId, question);

    // 2. Build context from top results
    const chapterContext = relevant.chapters.map(ch =>
      `Chapter ${ch.chapterNumber} - ${ch.title}:\n${ch.summary}`
    ).join("\n\n");

    const characterContext = relevant.characters.length > 0
      ? relevant.characters.map(char =>
          `Character: ${char.name}\n${char.description}`
        ).join("\n\n")
      : "";

    // 3. Ask Gemini using that context
    const prompt = `
      You are a helpful book assistant. Answer the user's question using ONLY the context below.
      If the answer isn't in the context, say you don't know.

      RELEVANT CHAPTERS:
      ${chapterContext}

      ${characterContext ? `RELEVANT CHARACTERS:\n${characterContext}` : ""}

      QUESTION: ${question}
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.status(200).json({
      success: true,
      answer,
      sourcedFrom: relevant.chapters.map(ch => ch.title)
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get books with reading content (for reading library)
 */
export const getBooksForReading = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log("Fetching reading books for user:", userId);
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    // Step 1: get all reading states for this user, most recently read first
    const userStates = await userBookStateModel
      .find({ userId })
      .sort({ lastReadAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!userStates.length) {
      console.log("Nothing is there for this user's state")
      return res.json({
        success: true,
        page,
        totalPages: 0,
        totalBooks: 0,
        books: []
      });
    }

    const bookIds = userStates.map(s => s.bookId);

    // Step 2: fetch those books (no hasContent filter)
    const booksWithContent = await bookModel
      .find({ _id: { $in: bookIds } })
      .select("_id title author genres image publishedYear visibility averageRating")
      .lean();

    const bookMap = {};
    booksWithContent.forEach(b => { bookMap[b._id.toString()] = b; });

    const stateMap = {};
    userStates.forEach(s => { stateMap[s.bookId.toString()] = s; });

    // Step 3: build response in the same order as reading states (most recent first)
    const books = bookIds
      .map(id => {
        const book = bookMap[id.toString()];
        const state = stateMap[id.toString()];
        if (!book) return null;
        return {
          bookId: book._id,
          title: book.title,
          author: book.author,
          genres: book.genres,
          publishedYear: book.publishedYear,
          coverImage: book.image,
          progressPercentage: state?.progressPercentage || 0,
          lastReadAt: state?.lastReadAt || null,
          currentChapter: state?.currentChapter || 1,
          averageRating: book.averageRating || 0,
          visibility: book.visibility || 'public',
        };
      })
      .filter(Boolean);

    const totalBooks = await userBookStateModel.countDocuments({ userId });

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalBooks / limit),
      totalBooks,
      books
    });

  } catch (err) {
    console.error("❌ Failed to fetch reading books:", err);
    next(err);
  }
};


export const toggleVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const book = await bookModel.findById(id);

    if (!book) {
      return next({ statusCode: 404, message: 'Book not found' });
    }

    if (book.user.toString() !== userId.toString()) {
      return next({ statusCode: 403, message: 'Unauthorized' });
    }

    const requestedVisibility = req.body?.visibility;
    const nextVisibility = requestedVisibility === "public" || requestedVisibility === "private"
      ? requestedVisibility
      : (book.visibility === 'public' ? 'private' : 'public');
    book.visibility = nextVisibility;
    await book.save();

    res.status(200).json({
      success: true,
      message: `Visibility changed to ${nextVisibility}`,
      visibility: nextVisibility,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete book content (keeps metadata)
 */
export const deleteBookContent = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const book = await bookModel.findById(bookId);
    if (!book) {
      return next({ statusCode: 404, message: "Book not found" });
    }

    if (book.user.toString() !== userId.toString()) {
      return next({ statusCode: 403, message: "Unauthorized" });
    }

    const knowledge = await bookKnowledgeModel.findOne({ bookId });
    if (!knowledge) {
      return next({ statusCode: 404, message: "No content found for this book" });
    }

    // Delete PDF from Cloudinary
    if (knowledge.fileUrl) {
      const publicId = knowledge.fileUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    }

    // Delete knowledge document
    await bookKnowledgeModel.findOneAndDelete({ bookId });

    // Delete all user states
    await userBookStateModel.deleteMany({ bookId });

    // Update book metadata
    await bookModel.findByIdAndUpdate(bookId, {
      hasContent: false
    });

    res.json({
      success: true,
      message: "Book content deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};

// ============================================
// PART 3: USER INTERACTIONS & METRICS
// Tracks user behavior for recommendations
// ============================================

/**
 * Track book view
 */
export const trackBookView = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return next({ statusCode: 401, message: "Unauthorized" });
    }

    // Increment view count
    await bookModel.findByIdAndUpdate(bookId, {
      $inc: { totalViews: 1 },
    });

    // Track interaction
    await interactionModel.create({
      userId,
      bookId,
      type: 'view',
      timestamp: new Date()
    });

    // Update user preferences (async, non-blocking)
    autoUpdatePreferences(userId, bookId, 'view')
      .catch(err => console.error('Preference update failed:', err));

    res.status(200).json({
      success: true,
      message: "View tracked successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track book purchase
 */
export const trackBookPurchase = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const quantity = parseInt(req.body.quantity || req.query.quantity) || 1;
    const userId = req.user?._id;

    if (!userId) {
      return next({ statusCode: 401, message: "Unauthorized" });
    }

    // Increment purchase count
    await bookModel.findByIdAndUpdate(bookId, {
      $inc: { totalPurchases: quantity },
    });

    // Track interaction
    await interactionModel.create({
      userId,
      bookId,
      type: 'purchase',
      timestamp: new Date()
    });

    // Update user preferences
    autoUpdatePreferences(userId, bookId, 'purchase')
      .catch(err => console.error('Preference update failed:', err));

    res.status(200).json({
      success: true,
      message: "Purchase tracked successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add or update rating
 */
export const addOrUpdateRating = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { bookId, rating, review } = req.body;

    if (!userId || !bookId) {
      return next({ statusCode: 400, message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return next({ statusCode: 400, message: "Rating must be between 1 and 5" });
    }

    // Verify book exists
    const book = await bookModel.findById(bookId);
    if (!book) {
      return next({ statusCode: 404, message: "Book not found" });
    }

    // Create or update rating
    const ratingDoc = await RatingModel.findOneAndUpdate(
      { user: userId, book: bookId },
      { rating, review },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    // Track interaction
    await interactionModel.create({
      userId,
      bookId,
      type: 'rating',
      rating,
      timestamp: new Date()
    });

    // Recalculate book rating
    await recalculateBookRating(bookId);

    // Update preferences
    autoUpdatePreferences(userId, bookId, 'rating', rating)
      .catch(err => console.error('Preference update failed:', err));

    res.status(200).json({
      success: true,
      message: "Rating saved successfully",
      rating: ratingDoc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete rating
 */
export const deleteRating = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { bookId } = req.params;

    const deleted = await RatingModel.findOneAndDelete({
      user: userId,
      book: bookId,
    });

    if (!deleted) {
      return next({ statusCode: 404, message: "Rating not found" });
    }

    await recalculateBookRating(bookId);

    res.status(200).json({
      success: true,
      message: "Rating removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recalculate book's average rating
 */
const recalculateBookRating = async (bookId) => {
  const stats = await RatingModel.aggregate([
    { $match: { book: new Types.ObjectId(bookId) } },
    {
      $group: {
        _id: "$book",
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await bookModel.findByIdAndUpdate(bookId, {
      averageRating: stats[0].avgRating,
      totalRatings: stats[0].totalRatings,
    });
  } else {
    await bookModel.findByIdAndUpdate(bookId, {
      averageRating: 0,
      totalRatings: 0,
    });
  }
};

// ============================================
// PART 4: RECOMMENDATIONS
// Powered by interaction data
// ============================================

/**
 * Get personalized recommendations
 */
export const getRecommendedBooks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await recommendationService.getRecommendations(userId, limit);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    next(error);
  }
};

/**
 * Get similar books
 */
export const getSimilarBooks = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const similarBooks = await recommendationService.getSimilarBooks(bookId, limit);

    res.json({
      success: true,
      similarBooks
    });
  } catch (error) {
    console.error('Error getting similar books:', error);
    next(error);
  }
};

/**
 * Get popular books
 */
export const getPopularBooks = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const popularBooks = await recommendationService.getPopularBooks([], limit);

    res.json({
      success: true,
      popularBooks
    });
  } catch (error) {
    console.error('Error getting popular books:', error);
    next(error);
  }
};

/**
 * Get new releases
 */
export const getNewBooks = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const newBooks = await recommendationService.getNewReleases([], limit);

    res.json({
      success: true,
      newBooks
    });
  } catch (error) {
    console.error('Error getting new releases:', error);
    next(error);
  }
};

// ============================================
// PART 5: AI FEATURES
// Chat and image description
// ============================================

/**
 * Generate book description from cover image
 */
export const describeImage = async (req, res, next) => {
  try {
    const { imageBase64, title, caption, author } = req.body;

    if (!imageBase64) {
      return next({ statusCode: 400, message: "No image provided" });
    }

    const prompt = `
      You are an expert book cataloguer.
      Describe the image in ONE single plain-text paragraph.
      Do NOT use bullet points, markdown, headings, or line breaks.
      
      Naturally incorporate these details if relevant:
      Title: ${title || "N/A"}
      Caption: ${caption || "N/A"}
      Author: ${author || "N/A"}
      
      Output must be a single continuous string. an example is this "Zara, a young archaeologist from Accra, uncovers a buried city beneath the Sahara that rewrites everything historians thought they knew about ancient African civilisation. But powerful forces will do anything to keep the discovery buried — including her."
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    res.json({
      success: true,
      description: result.response.text()
    });

  } catch (error) {
    console.error("Gemini describeImage error:", error);
    next(error);
  }
};

// controller
export const extractBookMetadata = async (req, res, next) => {
  try {
    if (!req.file) return next({ statusCode: 400, message: "No file uploaded" });

    const { PDFParse } = await import('pdf-parse');

    // 1. Get embedded metadata (title, author, pages)
    const infoParser = new PDFParse({ data: req.file.buffer });
    const infoResult = await infoParser.getInfo();
    await infoParser.destroy();

    // 2. Get full text separately
    const textParser = new PDFParse({ data: req.file.buffer });
    const textResult = await textParser.getText();
    await textParser.destroy();

    let metadata = {
      title: infoResult.info?.Title || null,
      author: infoResult.info?.Author || null,
      isbn: null,
      publishedYear: infoResult.info?.CreationDate
        ? new Date(infoResult.info.CreationDate).getFullYear()
        : null,
      language: infoResult.info?.Language || null,
      genres: [],
      description: null,
      totalPages: infoResult.total || 0,
      totalWords: textResult.text
        ? textResult.text.split(/\s+/).filter(Boolean).length
        : 0,
    };

    // 3. Use Gemini to fill gaps from first 3000 chars of text
    const rawText = textResult.text || '';
    if (rawText.length > 500 && (!metadata.title || !metadata.author)) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        console.log("Usising gemini to extract")

        const prompt = `
          Extract book metadata from this text sample. Return ONLY raw JSON, no markdown, no backticks.

          {
            "title": "book title or null",
            "author": "author full name or null",
            "isbn": "ISBN number if found or generate one",
            "publishedYear": number or null,
            "language": "language name or null",
            "genres": ["genre1", "genre2"],
            "description": "1-2 sentence description from actual story content, not preface or author note"
          }

          Text sample:
          ${rawText.substring(0, 3000)}
        `;

        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim().replace(/```json|```/g, '').trim();
        const aiMeta = JSON.parse(raw);

        // Only fill what pdf-parse missed
        metadata.title = metadata.title || aiMeta.title;
        metadata.author = metadata.author || aiMeta.author;
        metadata.isbn = aiMeta.isbn || null;
        metadata.publishedYear = metadata.publishedYear || aiMeta.publishedYear;
        metadata.language = metadata.language || aiMeta.language;
        metadata.genres = aiMeta.genres || [];
        metadata.description = aiMeta.description || null;
        console.log("Gemini metadata extraction successful")
      } catch (aiErr) {
        console.warn("⚠️ Gemini metadata extraction failed:", aiErr.message);
        // Non-fatal — return whatever pdf-parse got
      }
    }

    // 4. Resolve cover image
    let coverImage = null;
    if (metadata.isbn) {
      coverImage = `https://covers.openlibrary.org/b/isbn/${metadata.isbn}-L.jpg`;
    } else if (metadata.title) {
      try {
        const query = encodeURIComponent(`${metadata.title} ${metadata.author || ''}`);
        const olRes = await fetch(`https://openlibrary.org/search.json?title=${query}&limit=3`);
        if (olRes.ok) {
          const olData = await olRes.json();
          const first = olData?.docs?.find(d => d.cover_i);
          if (first) coverImage = `https://covers.openlibrary.org/b/id/${first.cover_i}-L.jpg`;
        }
      } catch {}
    }

    res.status(200).json({
      success: true,
      data: { ...metadata, coverImage }
    });

  } catch (error) {
    console.error("Metadata extraction error:", error);
    next({ statusCode: 500, message: "Failed to extract metadata from file" });
  }
};

/**
 * Chat with AI about a book
 * Moved to the chat.controller.js for better organization
 */

// Export for use in chat controller
export { bookKnowledgeModel, userBookStateModel };
