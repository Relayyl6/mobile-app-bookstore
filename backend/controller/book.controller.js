import { GEMINI_API_KEY } from "../config/env.js";
import cloudinary from "../lib/cloudinary.js";
import { autoUpdatePreferences } from "../lib/utils.js";
import bookModel from "../models/book.model.js";
import interactionModel from "../models/interaction.model.js";
import RatingModel from "../models/rating.model.js";
import recommendationService from "../services/recommendation.service.js";
import { GoogleGenerativeAI } from "@google/genai/node";


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
      book,
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

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const describeImage = async (req, res) => {
  const { imageBase64 } = req.body;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    },
    "Describe this image in a clear, structured way.",
  ]);

  res.json({ description: result.response.text() });
};



// example request to get the books 
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
                // https://res.cloudinary.com/cloudinary-could-name/image/upload/v223432122/image.png
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
