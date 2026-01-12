import jwt from "jsonwebtoken"
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js"
import userModel from '../models/auth.model.js';
import bookModel from '../models/book.model.js';
import interactionModel from '../models/interaction.model.js';
import AuthorExpiryModel from '../models/authorExpiry.model.js';


export const  generateToken = (userId) => {
    return jwt.sign(
        {userId: userId},
        JWT_SECRET,
        {expiresIn: JWT_EXPIRES_IN}
    )
}

// Valid genres - single source of truth
export const VALID_GENRES = [
  "Fiction", 
  "Non-Fiction", 
  "Fantasy", 
  "Science Fiction", 
  "Mystery", 
  "Thriller",
  "Romance", 
  "Horror", 
  "Biography", 
  "History", 
  "Self-Help", 
  "Poetry", 
  "Drama", 
  "Adventure" 
];

/**
 * Auto-update user preferences based on book interaction
 */
export const autoUpdatePreferences = async (userId, bookId, interactionType, rating = null) => {
  try {
    const book = await bookModel.findById(bookId);
    if (!book) {
      console.log(`❌ Book ${bookId} not found`);
      return;
    }

    const user = await userModel.findById(userId);
    if (!user) {
      console.log(`❌ User ${userId} not found`);
      return;
    }

    let shouldAddGenres = false;
    let shouldAddAuthor = false;

    // Determine what to update based on interaction type
    switch (interactionType) {
      case 'view':
        // Count total views for this book by this user
        const viewCount = await interactionModel.countDocuments({
          userId,
          bookId,
          type: 'view'
        });

        // Add genres if viewed 4+ times
        if (viewCount >= 4) {
          shouldAddGenres = true;
          
          // Add author if viewed 4+ times AND book has high average rating
          if (book.averageRating >= 4.0) {
            shouldAddAuthor = true;
          }
        }
        break;

      case 'purchase':
        // Always add genres on purchase
        shouldAddGenres = true;
        
        // Add author if book has high rating
        if (book.averageRating >= 4.0) {
          shouldAddAuthor = true;
        }
        break;

      case 'rating':
        // Add genres if user rated 4+ stars
        if (rating && rating >= 4) {
          shouldAddGenres = true;
          shouldAddAuthor = true;
        }
        break;

      case 'favorite':
        // Add both for favorites
        shouldAddGenres = true;
        shouldAddAuthor = true;
        break;

      default:
        console.log(`⚠️ Unknown interaction type: ${interactionType}`);
        return;
    }

    // Prepare update operations
    const updateOps = {};

    // Add valid genres
    if (shouldAddGenres && book.genres && book.genres.length > 0) {
      // Filter to only include valid genres
      const validBookGenres = book.genres.filter(genre => 
        VALID_GENRES.includes(genre)
      );

      if (validBookGenres.length > 0) {
        updateOps.$addToSet = updateOps.$addToSet || {};
        updateOps.$addToSet.preferredGenres = { $each: validBookGenres };
        console.log(`📚 Adding genres to user ${userId}: ${validBookGenres.join(', ')}`);
      }
    }

    // Add author to favorites
    if (shouldAddAuthor && book.author) {
      updateOps.$addToSet = updateOps.$addToSet || {};
      updateOps.$addToSet.favoriteAuthors = book.author;
      console.log(`✍️ Adding author to user ${userId}: ${book.author}`);

      // Schedule auto-expiry (30 days from now)
      await scheduleAuthorRemoval(userId, book.author, 30);
    }

    // Apply updates if any
    if (Object.keys(updateOps).length > 0) {
      await userModel.findByIdAndUpdate(userId, updateOps);
      console.log(`✅ Successfully updated preferences for user ${userId}`);
    } else {
      console.log(`ℹ️ No preference updates needed for user ${userId}`);
    }

  } catch (error) {
    console.error('❌ Error auto-updating preferences:', error);
    // Don't throw - this is a background operation that shouldn't break the main flow
  }
};

/**
 * Schedule removal of author from favorites after specified days
 */
const scheduleAuthorRemoval = async (userId, author, daysUntilRemoval = 30) => {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysUntilRemoval);

    // Check if expiry record already exists
    const existing = await AuthorExpiryModel.findOne({ userId, author });

    if (existing) {
      // Update expiry date (reset the timer)
      await AuthorExpiryModel.findByIdAndUpdate(existing._id, {
        expiryDate,
        updatedAt: new Date()
      });
      console.log(`🔄 Reset expiry for author ${author} (user ${userId})`);
    } else {
      // Create new expiry record
      await AuthorExpiryModel.create({
        userId,
        author,
        expiryDate
      });
      console.log(`⏰ Scheduled removal of author ${author} for ${expiryDate.toLocaleDateString()}`);
    }

  } catch (error) {
    console.error('❌ Error scheduling author removal:', error);
  }
};

/**
 * Clean up expired favorite authors
 * Run this from a cron job
 */
export const cleanupExpiredAuthors = async () => {
  try {
    const now = new Date();
    
    // Find all expired records
    const expiredRecords = await AuthorExpiryModel.find({
      expiryDate: { $lte: now }
    });

    console.log(`🧹 Found ${expiredRecords.length} expired author preferences to clean up`);

    let removedCount = 0;
    let keptCount = 0;

    for (const record of expiredRecords) {
      try {
        // Check for recent interactions with this author's books
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        // Get all books by this author
        const authorBooks = await bookModel.find({ author: record.author }).select('_id');
        const authorBookIds = authorBooks.map(b => b._id);

        // Check for recent meaningful interactions
        const recentInteractions = await interactionModel.countDocuments({
          userId: record.userId,
          bookId: { $in: authorBookIds },
          type: { $in: ['rating', 'purchase', 'favorite'] },
          timestamp: { $gte: thirtyDaysAgo }
        });

        if (recentInteractions === 0) {
          // No recent interactions - remove author
          await userModel.findByIdAndUpdate(record.userId, {
            $pull: { favoriteAuthors: record.author }
          });
          removedCount++;
          console.log(`🗑️ Removed author "${record.author}" from user ${record.userId}`);
        } else {
          // User still interacts with this author - extend expiry
          const newExpiryDate = new Date();
          newExpiryDate.setDate(newExpiryDate.getDate() + 30);
          
          await AuthorExpiryModel.findByIdAndUpdate(record._id, {
            expiryDate: newExpiryDate,
            updatedAt: new Date()
          });
          keptCount++;
          console.log(`🔄 Extended expiry for author "${record.author}" (user still engaged)`);
          continue; // Don't delete the expiry record
        }

        // Delete the expiry record
        await AuthorExpiryModel.findByIdAndDelete(record._id);

      } catch (err) {
        console.error(`❌ Error processing expiry for ${record.author}:`, err);
      }
    }

    console.log(`✅ Cleanup complete: ${removedCount} removed, ${keptCount} extended`);
    
    return {
      total: expiredRecords.length,
      removed: removedCount,
      kept: keptCount
    };

  } catch (error) {
    console.error('❌ Error in cleanupExpiredAuthors:', error);
    throw error;
  }
};

export default {
  autoUpdatePreferences,
  cleanupExpiredAuthors,
  VALID_GENRES
};