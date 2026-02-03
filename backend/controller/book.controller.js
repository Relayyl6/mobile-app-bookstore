import { GEMINI_API_KEY } from "../config/env.js";
import cloudinary from "../lib/cloudinary.js";
import { autoUpdatePreferences } from "../lib/utils.js";
import bookModel from "../models/book.model.js";
import interactionModel from "../models/interaction.model.js";
import RatingModel from "../models/rating.model.js";
import recommendationService from "../services/recommendation.service.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import uploadToCloudinary, { analyzeChapterWithAI, checkPdf, embedText, extractPdfInfo, extractPdfText, splitIntoChapters, splitChapterIntoPages } from '../lib/tools.js'
import { PDFParse } from 'pdf-parse'
import bookKnowledgeModel from "../models/knowledge.model.js";
import userBookStateModel from "../models/userBookState.model.js";

export const createBook = async (req, res, next) => {
  // console.log("Trying to create book")
  try {
    const userId = req.user?._id;

    if (!userId) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      return next(error);
    }

    const {
      title,
      subTitle,
      author,
      caption,
      description,
      genres,
      image,
      price,
      isbn,
      publishedYear
    } = req.body;

    /* -------- REQUIRED FIELD CHECK -------- */
    const missing = [
      !title && "title",
      !author && "author",
      !caption && "caption",
      !genres && "genres",
      !image && "image",
      !price && "price",
    ].filter(Boolean);

    if (missing.length > 0) {
      const formatter = new Intl.ListFormat("en", {
        style: "long",
        type: "conjunction",
      });

      const error = new Error(
        `${formatter.format(missing)} ${missing.length > 1 ? "are" : "is"} missing from the request body`
      );
      error.statusCode = 400;
      return next(error);
    }

    /* -------- UNIQUE CHECKS -------- */
    const existingBook = await bookModel.findOne({
      $or: [{ title }, { isbn }],
    });

    if (existingBook) {
      const error = new Error("Book with same title or ISBN already exists");
      error.statusCode = 400;
      return next(error);
    }

    /* -------- IMAGE UPLOAD -------- */
    const uploadResponse = await cloudinary.uploader.upload(image, {
      resource_type: "image",
    });

    const imageUrl = uploadResponse.secure_url;

    /* -------- CREATE BOOK -------- */
    const book = await bookModel.create({
      title,
      subTitle,
      author,
      isbn,
      caption,
      description,
      genres,
      image: imageUrl,
      price,
      publishedYear,
      user: userId,

      // recommendation metrics (defaults are fine but explicit is okay)
      averageRating: 0,
      totalRatings: 0,
      totalViews: 0,
      totalPurchases: 0,
    });

    res.status(201).json({
      message: "Book created successfully",
      fullBook: {
        id: book._id,
        ...book.toObject()
      }
    });
  } catch (error) {
    // Cloudinary error normalization
    if (typeof error === "object" && error.message && typeof error.message === "object") {
      const err = new Error(error.message.message || "Image upload failed");
      err.statusCode = error.http_code || 400;
      return next(err);
    }
  
    return next(error);
  }

};

export const describeImage = async (req, res) => {
  const { imageBase64, title, caption, author } = req.body;

  const prompt = `
    You are an expert book cataloguer.
    Describe the image visually and include the following information:
    - Title: ${title || "N/A"}
    - Caption: ${caption || "N/A"}
    - Author: ${author || "N/A"}
  `;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // fast + supports images
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64, // must be raw base64 only
            },
          },
          { text: prompt },
        ],
      },
    ],
  });

  res.json({ description: result.response.text() });
};

export const chatWithBook = async (req, res) => {
  try {
    const { userId, bookId, message } = req.body;

    //  Load user reading state
    const state = await userBookStateModel.findOne({ userId, bookId }, { upsert: true, new: true });
    if (!state) return res.status(404).json({ error: "Reading state not found" });

    if (state.currentChapter === 1 && state.maxSpoilerChapterAllowed === 1) {
      return res.json({
        reply: "You haven’t started this book yet. Want a spoiler-free intro first?"
      });
    }

    //  Generate embedding for the question
    const queryEmbedding = await embedText(message);

    const characterResults = await bookKnowledgeModel.aggregate([
      { $match: { bookId } },
      { $unwind: "$characters" },
      {
        $vectorSearch: {
          index: "characterEmbeddingIndex",
          path: "characters.embedding",
          queryVector: queryEmbedding,
          numCandidates: 20,
          limit: 3
        }
      },
      {
        $project: {
          name: "$characters.name",
          description: "$characters.description",
          relationships: "$characters.relationships"
        }
      }
    ]);

    const recapChapters = await bookKnowledgeModel.aggregate([
      { $match: { bookId } },
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



    //  Vector search only SAFE chapters
    const results = await bookKnowledgeModel.aggregate([
      { $match: { bookId } },
      { $unwind: "$chapters" },
      {
        $match: {
          "chapters.chapterNumber": { $lte: state.maxSpoilerChapterAllowed }
        }
      },
      {
        $vectorSearch: {
          index: "chapterEmbeddingIndex",
          path: "chapters.embedding",
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 5
        }
      },
      {
        $project: {
          chapterNumber: "$chapters.chapterNumber",
          summary: "$chapters.summary",
          themes: "$chapters.themes",
          tone: "$chapters.tone",
          characters: "$chapters.characters"
        }
      }
    ]);

    if (!results.length) {
      return res.json({ reply: "I don't have enough context yet — try reading a bit more 📖" });
    }


    const contextBlocks = [];

    if (characterResults.length) {
      contextBlocks.push("Character Information:");
      characterResults.forEach(c =>
        contextBlocks.push(`${c.name}: ${c.description}`)
      );
    }

    if (chapterResults.length) {
      contextBlocks.push("Relevant Chapter Summaries:");
      chapterResults.forEach(ch =>
        contextBlocks.push(`Chapter ${ch.chapterNumber}: ${ch.summary}`)
      );
    }

    if (recapChapters.length) {
      contextBlocks.push("Recent Events:");
      recapChapters.forEach(ch =>
        contextBlocks.push(`Chapter ${ch.chapterNumber}: ${ch.summary}`)
      );
    }

    if (state.lastAIInteractionSummary) {
      contextBlocks.unshift(`Previous discussion summary: ${state.lastAIInteractionSummary}`);
    }

    const contextText = contextBlocks.join("\n\n");
    if (!contextText.trim()) {
      return res.json({
        reply: "I don’t have enough context from what you’ve read so far 📖"
      });
    }


    // 5️⃣ Ask AI with spoiler protection + tone preference
    const prompt = `
      You are a spoiler-safe AI book companion.

      You must answer ONLY using the supplied context.
      If the answer is not in the context, say you don’t have enough information yet.

      Reader progress limit: Chapter ${state.maxSpoilerChapterAllowed}
      Never reveal or hint at events beyond this point.

      Use the reader’s preferred tone: ${state.tonePreferenceForAI}

      Context:
      ${contextText}

      Question:
      ${message}
    `;

    const aiResult = await model.generateContent(prompt);
    const reply = aiResult.response.text();

    // 6️⃣ Update memory
    const memorySummary = `User asked: "${message}" — AI explained without spoilers.`;

    await userBookStateModel.updateOne(
      { userId, bookId },
      {
        lastAIInteractionSummary: memorySummary,
        lastReadAt: new Date()
      }
    );

    res.status(200).json({ success: true, result: reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
};


export const uploadFile = async (req, res) => {
    try {
      // 🧾 Text fields from formData
      const fullUserPrompt = req.body.prompt;
      const text = req.body.text;
      const image = req.body.image;

      console.log(req.file)

      // 📁 File
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      
      const fileUrl = await uploadToCloudinary(req.file.buffer, "raw");
      console.log("Cloudinary URL:", fileUrl);
      console.log("Other fields:", { fullUserPrompt, text, image });

      // const checkPdf = await checkPdf(fileUrl);
      const pdfInfo = await extractPdfInfo(fileUrl);
      const pdfText = await extractPdfText(fileUrl);

      const chapters = splitIntoChapters(pdfText);
      const chapterAnalyses = await Promise.all(
        chapters.map(ch => analyzeChapterWithAI(model, ch.content, ch.chapterNumber))
      );
      const bookOverview = await analyzeBookOverview(model, pdfText);

      const bookId = req.body.prompt.id

      await bookKnowledgeModel.create({
        bookId,
        fileUrl,
        metadata: pdfInfo,
        overview: bookOverview,
        chapters: chapterAnalyses.map((analysis, i) => ({
          chapterNumber: i + 1,
          title: chapters[i].title || `Chapter ${i+1}`,
          content: chapters[i].content,      // FULL TEXT FOR READING
          summary: analysis.summary,
          pages: splitChapterIntoPages(chapters[i].content),
          themes: analysis.themes,
          tone: analysis.tone,
          embedding: [],
          characters: analysis.characters
        })),
        characters: bookOverview.mainCharacters
      });

      for (const chapter of chapterAnalyses) {
        const embedding = await embedText(genAI, chapter.summary);
            
        await bookKnowledgeModel.updateOne(
          { bookId, "chapters.chapterNumber": chapter.chapterNumber },
          { $set: { "chapters.$.embedding": embedding } }
        );
      }

      for (const char of bookOverview.mainCharacters) {
        const embedding = await embedText(genAI, char.description);

        await bookKnowledgeModel.updateOne(
          { bookId, "characters.name": char.name },
          { $set: { "characters.$.embedding": embedding } }
        );
      }

      await userBookStateModel.create({
        userId: req.user?._id,
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

      res.json({
        success: true,
        bookId,
        userId: req.user?._id,
        message: "File uploaded and processed successfully"
      });
    } catch (error) {
      console.error("An error occured", error)
    }
}

// example request to get uploaded books
export const getAllBooksForReading = async (req, res) => {
  try {
    const books = await bookKnowledgeModel.find({})
      .populate("uploader", "username email profileImage") // optional, if you have uploader reference
      .select("bookId fileUrl overview.metadata"); // minimal info for list

    res.json({ success: true, books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

export const getChapterForReading = async (req, res) => {
  const { bookId, chapterNumber } = req.params;

  try {
    const book = await bookKnowledgeModel.findOne(
      { bookId, "chapters.chapterNumber": chapterNumber },
      { "chapters.$": 1, title: 1, author: 1 }
    );

    if (!book) return res.status(404).json({ error: "Chapter not found" });

    const chapter = book.chapters[0];

    res.json({
      bookTitle: book.metadata?.title,
      chapterNumber: chapter.chapterNumber,
      chapterTitle: chapter.title,
      content: chapter.content,   // 👈 This is what mobile displays
      fullBook: book
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load chapter" });
  }
};

// delete an uploaded book reaading
export const deleteBookReading = async (req, res) => {
  const { bookId } = req.params;

  try {
    const book = await bookKnowledgeModel.findById(bookId);
    if (!book) return res.status(404).json({ error: "Book not found" });

    // 1️⃣ Delete from Cloudinary (raw file)
    const publicId = book.fileUrl
      .split("/").pop()
      .split(".")[0]; // crude extraction, adjust if we store public_id
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // 2️⃣ Delete from DB
    await bookKnowledgeModel.findByIdAndDelete(bookId);

    res.json({ success: true, message: "Book deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete book" });
  }
};




// example request to get the books as in recommendation
// const response = await fetch("https://localhost:3000/api/v1/books?page=1&limit=5")
export const getBooks = async (req, res) => {
    try {
      // todo: implement pagination -> infinite loading(scrolling)
      const page = req.query.page || 1;
      const limit = req.query.limit || 5;
      const skip = (page - 1) * limit;
      const books = await bookModel.find().sort({ created: -1 }).skip(skip).limit(limit).populate("User", "username profileImage"); // createdAt: -1 means desc
      const totalBooks = bookModel.countDocuments();
      res.status(200).json({
          message: "Gotten books successfully",
          books,
          currentPage: page,
          totalBooks,
          totalPages: Math.ceil(totalBooks / limit),
      })
    } catch (error) {
        console.error("an error occured", error.message)
        return next(error)
    }
}

export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params

        const book = bookModel.findById(id)

        if (book.user.toString() !== req.user._id.toString()) {
            const error = new Error("Unauthorized")
            error.statusCode = 401;
            return next(error)
        }

        // delete the image from cloudinary as well
        if (book.image && book.image.includes("cloudinary")) {
            try {
                // how the cloudinary returns the image_url
                // https://res.cloudinary.com/cloudinary-could-name/image4r3/upload/v223432122/image.png
                const publicId = book.image.split("/").pop().split(".")[0]; // id would be image from the example
                await cloudinary.uploader.destroy(publicId)
            } catch (error) {
                const errorMsg = new Error(`An error occured whiel deleting image from cloudinary, ${error}`);
                errorMsg.statusCode = 400;
                return next(errorMsg)
            }
        }

        await book.deleteOne();

        res.status(200).json({
            message: "book deleted successfully"
        })
    } catch (error) {
        return next(error)
    }
}

export const updateBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      return next(error);
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
    ];

    const updateFields = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }

    /* -------- IMAGE UPDATE -------- */
    if (req.body.image) {
      const uploadResponse = await cloudinary.uploader.upload(req.body.image);
      updateFields.image = uploadResponse.secure_url;
    }

    const book = await bookModel.findOneAndUpdate(
      { _id: bookId, user: userId }, // ownership enforced here
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!book) {
      const error = new Error("Book not found or access denied");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      message: "Book successfully updated",
      book,
    });
  } catch (error) {
    next(error);
  }
};

// get recommended books by the logged in user 
export const getSingleBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      return next(error);
    }

    const book = await bookModel.findById(id)

    res.status(200).json ({
      message: "Book successfully requested",
      book
    })
  } catch (error) {
    return next(error)
  }
}




// recommendation algorithm

export const getRecommendedBook = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

export const getSimilarBooks = async (req, res) => {
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
    const errorMsg = new Error(`Failed to get similar books: ${error}`)
    errorMsg.statusCode = 500
    next(errorMsg)
  }
}

export const getPopularBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const popularBooks = await recommendationService.getPopularBooks([], limit);
    
    res.json({
      success: true,
      popularBooks
    });
  } catch (error) {
    console.error('Error getting popular books:', error);
    const errorMsg = new Error(`Failed to get popular books: ${error}`)
    errorMsg.statusCode = 500
    next(errorMsg)
  }
}

export const getNewBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const newBooks = await recommendationService.getNewReleases([], limit);
    
    res.json({
      success: true,
      newBooks
    });
  } catch (error) {
    console.error('Error getting new releases:', error);
    const errorMsg = new Error(`Failed to get new releases: ${error}`)
    errorMsg.statusCode = 500
    next(errorMsg)
  }
}





// Helper unctios




// Call this when:
//  user opens book detail page
export const incrementBookViews = async (req, res) => {
  try {
    const bookId = req.params.id
    const userId = req.user?._id;

    if (!userId) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      return next(error);
    }

    await bookModel.findByIdAndUpdate(bookId, {
        $inc: { totalViews: 1 },
    });

    await interactionModel.create({
      userId,
      bookId,
      type: 'view',
      timestamp: new Date()
    });

    // Auto-update preferences (async, non-blocking)
    autoUpdatePreferences(userId, bookId, 'view')
      .catch(err => console.error('Preference update failed:', err));
    
    res.status(200).json({
      success: true,
      message: "Views increased successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Call this when:
//  payment is successful
//  order status = completed
export const incrementBookPurchases = async (req, res) => {
  try {
    const bookId = req.params.id
    const quantity = parseInt(req.body.quantity || req.query.quantity) || 1;
    const userId = req.user?._id;

    if (!userId) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      return next(error);
    }

    await bookModel.findByIdAndUpdate(bookId, {
      $inc: { totalPurchases: quantity },
    });

    await interactionModel.create({
      userId,
      bookId,
      type: 'purchase',
      timestamp: new Date()
    });

    // Auto-update preferences (async, non-blocking)
    autoUpdatePreferences(userId, bookId, 'purchase')
      .catch(err => console.error('Preference update failed:', err));

    res.status(200).json({
      message: "Book purchases increased successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Call this when:
//  a user adds a rating
//  a rating is updated or deleted
export const recalculateBookRating = async (bookId) => {
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
    // No ratings left, reset to defaults
    await bookModel.findByIdAndUpdate(bookId, {
      averageRating: 0,
      totalRatings: 0,
    });
  }
};


export const addOrUpdateRating = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { bookId, rating, review } = req.body;

    if (!userId || !bookId) {
        const error = new Error("Missing required fields");
        error.statusCode = 400;
        return next(error);
    }

    if (rating < 1 || rating > 5) {
      const error = new Error("Rating must be between 1 and 5");
      error.statusCode = 400;
      return next(error);
    }

    // Check if book exists
    const book = await bookModel.findById(bookId);
    if (!book) {
      const error = new Error("Book not found");
      error.statusCode = 404;
      return next(error);
    }

    const ratingDoc = await RatingModel.findOneAndUpdate(
      {user: userId, book: bookId},
      {rating, review},
      {
          upsert: true, // creates if missing
          new: true, // returns updated/created doc
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

    // Recalculate book rating stats
    await recalculateBookRating(bookId);

    // Auto-update preferences (async, non-blocking)
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

export const deleteRating = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { bookId } = req.params;

    const deleted = await RatingModel.findOneAndDelete({
      user: userId,
      book: bookId,
    });

    if (!deleted) {
      const error = new Error("Rating not found");
      error.statusCode = 404;
      return next(error);
    }

    await recalculateBookRating(bookId);

    res.status(200).json({
      message: "Rating removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
