// ============================================
// CHAT CONTROLLER - AI FEATURES
// Separated from book controller for clarity
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import bookKnowledgeModel from "../models/knowledge.model.js";
import userBookStateModel from "../models/userBookState.model.js";
import userGeneralStateModel from "../models/userGeneralState.model.js";
import { embedText } from '../lib/tools.js';

/**
 * Chat with AI - supports both general chat and book-specific chat
 */
export const chatWithBook = async (req, res, next) => {
  console.log("💬 [CHAT] Route hit");

  try {
    const { userId, bookId, message, systemInstruction } = req.body;

    if (!userId || !message) {
      return next({
        statusCode: 400,
        message: "Missing userId or message"
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: systemInstruction || "You are a helpful AI assistant inside a book reading app.",
    });

    // ============================================
    // MODE 1: GENERAL CHAT (No book context)
    // ============================================
    if (!bookId) {
      console.log("🤖 [CHAT] General AI mode (no bookId)");

      // Load or create general conversation state
      let generalState = await userGeneralStateModel.findOne({ userId });
      if (!generalState) {
        generalState = await userGeneralStateModel.create({
          userId,
          messages: []
        });
      }

      // Build conversation history for Gemini
      const contentsForAI = [
        // System instruction
        {
          role: "user",
          parts: [{
            text: "You are a helpful AI assistant inside a book reading app. Maintain conversational context and answer naturally."
          }]
        },
        // Previous conversation
        ...generalState.messages.map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        })),
        // Current message
        {
          role: "user",
          parts: [{ text: message }]
        }
      ];

      console.log("📤 [CHAT] Sending to Gemini...");
      const generalAiResult = await model.generateContent({
        contents: contentsForAI
      });

      const generalReply = generalAiResult.response.text();

      // Save conversation memory
      generalState.messages.push(
        { role: "user", text: message },
        { role: "model", text: generalReply }
      );

      generalState.lastUpdated = new Date();

      // Trim to last 20 turns (40 messages)
      if (generalState.messages.length > 40) {
        generalState.messages = generalState.messages.slice(-40);
      }

      await generalState.save();

      return res.status(200).json({
        success: true,
        result: generalReply,
        mode: "general"
      });
    }

    // ============================================
    // MODE 2: BOOK-AWARE CHAT (With book context)
    // ============================================
    console.log("📚 [CHAT] Book-aware mode for bookId:", bookId);

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return next({ statusCode: 400, message: "Invalid bookId" });
    }

    // Load or create reading state
    let state = await userBookStateModel.findOne({ userId, bookId });
    
    if (!state) {
      // Create initial state if doesn't exist
      state = await userBookStateModel.create({
        userId,
        bookId,
        currentChapter: 1,
        currentPage: 1,
        progressPercentage: 0,
        lastReadAt: new Date(),
        recentCharactersViewed: [],
        bookmarks: [],
        userNotes: [],
        tonePreferenceForAI: "friendly",
        maxSpoilerChapterAllowed: 1,
        lastAIInteractionSummary: ""
      });
    }

    console.log("📖 [CHAT] Reading state:", {
      currentChapter: state.currentChapter,
      maxSpoilerChapter: state.maxSpoilerChapterAllowed
    });

    // Check if user just started the book
    if (state.currentChapter === 1 && state.maxSpoilerChapterAllowed === 1) {
      console.log("🆕 [CHAT] User just started book");
      
      const prompt = `You are a friendly AI guide for a book reading app. The user has just started a new book and hasn't read beyond chapter ${state.currentChapter}. They asked: "${message}". Please respond with a warm, spoiler-free introduction to the book that encourages them to start reading. Do NOT reveal any plot details or spoilers.`;

      const specificAiResult = await model.generateContent(prompt);
      const specificReply = specificAiResult.response.text();

      // Save interaction
      await userBookStateModel.updateOne(
        { userId, bookId },
        {
          lastAIInteractionSummary: `User asked: "${message}"`,
          lastReadAt: new Date()
        }
      );

      return res.status(200).json({
        success: true,
        result: specificReply,
        mode: "book-aware",
        spoilerSafe: true
      });
    }

    // Generate embedding for vector search
    console.log("🧠 [CHAT] Generating embedding...");
    const queryEmbedding = await embedText(message);

    // Vector search for relevant characters
    console.log("👥 [CHAT] Searching for relevant characters...");
    const characterResults = await bookKnowledgeModel.aggregate([
      {
        $vectorSearch: {
          index: "characterEmbeddingIndex",
          path: "characters.embedding",
          queryVector: queryEmbedding,
          numCandidates: 20,
          limit: 3
        }
      },
      { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
      { $unwind: "$characters" },
      {
        $project: {
          name: "$characters.name",
          description: "$characters.description"
        }
      }
    ]);

    console.log(`✅ [CHAT] Found ${characterResults.length} relevant characters`);

    // Get recent chapter recap
    console.log("📚 [CHAT] Getting recent chapter recap...");
    const recapChapters = await bookKnowledgeModel.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
      { $unwind: "$chapters" },
      { $match: { "chapters.chapterNumber": { $lte: state.maxSpoilerChapterAllowed } } },
      { $sort: { "chapters.chapterNumber": -1 } },
      { $limit: 2 },
      {
        $project: {
          chapterNumber: "$chapters.chapterNumber",
          summary: "$chapters.summary"
        }
      }
    ]);

    console.log(`✅ [CHAT] Found ${recapChapters.length} recent chapters`);

    // Vector search for relevant chapters
    console.log("🔎 [CHAT] Searching for relevant chapters...");
    const chapterResults = await bookKnowledgeModel.aggregate([
      {
        $vectorSearch: {
          index: "chapterEmbeddingIndex",
          path: "chapters.embedding",
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 5,
          filter: {
            bookId: new mongoose.Types.ObjectId(bookId),
            "chapters.chapterNumber": { $lte: state.maxSpoilerChapterAllowed }
          }
        }
      },
      { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
      { $unwind: "$chapters" },
      { $match: { "chapters.chapterNumber": { $lte: state.maxSpoilerChapterAllowed } } },
      {
        $project: {
          chapterNumber: "$chapters.chapterNumber",
          summary: "$chapters.summary",
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    console.log(`✅ [CHAT] Found ${chapterResults.length} relevant chapters`);

    if (chapterResults.length === 0 && characterResults.length === 0) {
      console.log("⚠️ [CHAT] No relevant context found");
      return res.json({
        success: true,
        result: "I don't have enough context yet about this part of the book. Try reading a bit more, or ask me something about the chapters you've already read! 📖",
        mode: "book-aware"
      });
    }

    // Build context blocks
    const contextBlocks = [];

    // Add previous AI interaction summary
    if (state.lastAIInteractionSummary) {
      contextBlocks.push(`Previous discussion: ${state.lastAIInteractionSummary}`);
    }

    // Add character information
    characterResults.forEach(c =>
      contextBlocks.push(`Character: ${c.name} — ${c.description}`)
    );

    // Add relevant chapter summaries
    chapterResults.forEach(ch =>
      contextBlocks.push(`Chapter ${ch.chapterNumber}: ${ch.summary}`)
    );

    // Add recent events
    recapChapters.forEach(ch =>
      contextBlocks.push(`Recent event from Chapter ${ch.chapterNumber}: ${ch.summary}`)
    );

    const contextText = contextBlocks.join("\n\n");
    console.log(`🧩 [CHAT] Context built: ${contextText.length} characters`);

    // Build prompt for Gemini
    const prompt = `
      You are a spoiler-safe AI book companion.
      
      ${systemInstruction ? systemInstruction : ""}

      RULES:
      - Use ONLY the provided book context
      - Do NOT speculate or invent details beyond what's given
      - Respect the reader's progress limit strictly
      - If unsure or if information is beyond the reader's progress, say you don't have that information yet
      - Be conversational and engaging
      - Reference specific chapters and characters when relevant

      Reader's progress limit: Chapter ${state.maxSpoilerChapterAllowed}
      Current chapter: ${state.currentChapter}

      Book Context:
      ${contextText}

      Reader's Question:
      ${message}

      Provide a helpful, spoiler-safe response based only on the context above.
    `;

    console.log("🤖 [CHAT] Sending to Gemini...");
    const aiResult = await model.generateContent(prompt);
    const reply = aiResult.response.text();
    console.log("✅ [CHAT] AI reply received");

    // Save interaction summary
    await userBookStateModel.updateOne(
      { userId, bookId },
      {
        lastAIInteractionSummary: `User asked: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
        lastReadAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      result: reply,
      mode: "book-aware",
      context: {
        charactersFound: characterResults.length,
        chaptersFound: chapterResults.length,
        maxSpoilerChapter: state.maxSpoilerChapterAllowed
      }
    });

  } catch (err) {
    console.error("🔥 [CHAT] Error:", err);
    next(err);
  }
};

/**
 * Get chat history for a book
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const { userId, bookId } = req.params;

    if (!bookId) {
      // Get general chat history
      const generalState = await userGeneralStateModel.findOne({ userId });
      
      return res.json({
        success: true,
        messages: generalState?.messages || [],
        mode: "general"
      });
    }

    // Get book-specific chat history
    const state = await userBookStateModel.findOne({ userId, bookId });

    if (!state) {
      return res.json({
        success: true,
        messages: [],
        mode: "book-aware"
      });
    }

    res.json({
      success: true,
      lastInteraction: state.lastAIInteractionSummary,
      mode: "book-aware",
      readingProgress: {
        currentChapter: state.currentChapter,
        maxSpoilerChapter: state.maxSpoilerChapterAllowed
      }
    });

  } catch (err) {
    console.error("Error getting chat history:", err);
    next(err);
  }
};

/**
 * Clear chat history
 */
export const clearChatHistory = async (req, res, next) => {
  try {
    const { userId, bookId } = req.params;

    if (!bookId) {
      // Clear general chat history
      await userGeneralStateModel.updateOne(
        { userId },
        { $set: { messages: [] } }
      );

      return res.json({
        success: true,
        message: "General chat history cleared"
      });
    }

    // Clear book-specific interaction summary
    await userBookStateModel.updateOne(
      { userId, bookId },
      { $set: { lastAIInteractionSummary: "" } }
    );

    res.json({
      success: true,
      message: "Book chat history cleared"
    });

  } catch (err) {
    console.error("Error clearing chat history:", err);
    next(err);
  }
};

/**
 * Update AI preferences for a book
 */
export const updateAIPreferences = async (req, res, next) => {
  try {
    const { userId, bookId } = req.params;
    const { tonePreference, maxSpoilerChapterAllowed } = req.body;

    const updateFields = {};
    if (tonePreference) updateFields.tonePreferenceForAI = tonePreference;
    if (maxSpoilerChapterAllowed !== undefined) {
      updateFields.maxSpoilerChapterAllowed = maxSpoilerChapterAllowed;
    }

    const state = await userBookStateModel.findOneAndUpdate(
      { userId, bookId },
      { $set: updateFields },
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
      message: "AI preferences updated",
      preferences: {
        tonePreference: state.tonePreferenceForAI,
        maxSpoilerChapter: state.maxSpoilerChapterAllowed
      }
    });

  } catch (err) {
    console.error("Error updating AI preferences:", err);
    next(err);
  }
};

export default {
  chatWithBook,
  getChatHistory,
  clearChatHistory,
  updateAIPreferences
};