// services/recommendationService.js
import bookModel from "../models/book.model.js"
import userModel from "../models/auth.model.js"
import interactionModel from "../models/interaction.model.js";

class RecommendationService {
  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId, limit = 10) {
    const user = await userModel.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Get user's interaction history
    const userInteractions = await interactionModel.find({ userId })
        .populate('bookId')
        .sort({ timestamp: -1 });

    // Combine different recommendation strategies
    const recommendations = await this.combineRecommendations(user, userInteractions, limit);

    return recommendations;
  }

  /**
   * Combine multiple recommendation strategies
   */
  async combineRecommendations(user, userInteractions, limit) {
    const weights = {
        collaborative: 0.4,
        contentBased: 0.3,
        popularity: 0.2,
        newReleases: 0.1
    };

    // Get books user has already interacted with
    const interactedBookIds = userInteractions.map(i => i.bookId._id.toString());

    // Get recommendations from different strategies
    const [collaborative, contentBased, popular, newBooks] = await Promise.all([
        this.getCollaborativeRecommendations(user._id, interactedBookIds, 20),
        this.getContentBasedRecommendations(user, interactedBookIds, 20),
        this.getPopularBooks(interactedBookIds, 10),
        this.getNewReleases(interactedBookIds, 10)
    ]);

    // Score and combine recommendations
    const scoredBooks = new Map();

    // Add collaborative filtering results
    collaborative.forEach((book, index) => {
        const score = weights.collaborative * (1 - index / collaborative.length);
        this.addOrUpdateScore(scoredBooks, book, score);
    });

    // Add content-based results
    contentBased.forEach((book, index) => {
        const score = weights.contentBased * (1 - index / contentBased.length);
        this.addOrUpdateScore(scoredBooks, book, score);
    });

    // Add popular books
    popular.forEach((book, index) => {
        const score = weights.popularity * (1 - index / popular.length);
        this.addOrUpdateScore(scoredBooks, book, score);
    });

    // Add new releases
    newBooks.forEach((book, index) => {
        const score = weights.newReleases * (1 - index / newBooks.length);
        this.addOrUpdateScore(scoredBooks, book, score);
    });

    // Sort by score and return top N
    const sortedBooks = Array.from(scoredBooks.entries())
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, limit)
        .map(entry => entry[1].book);

    return sortedBooks;
  }

  /**
   * Collaborative Filtering: Find similar users and recommend what they liked
   */
  async getCollaborativeRecommendations(userId, excludeBookIds, limit) {
    // Find users who have similar tastes
    const userInteractions = await interactionModel.find({ 
        userId,
        type: { $in: ['purchase', 'rating', 'favorite'] }
    });

    const userBookIds = userInteractions.map(i => i.bookId);

    // Find other users who interacted with the same books
    const similarUserInteractions = await interactionModel.find({
        bookId: { $in: userBookIds },
        userId: { $ne: userId },
        type: { $in: ['purchase', 'rating', 'favorite'] }
    }).populate('bookId');

    // Count book occurrences from similar users
    const bookScores = {};
    
    similarUserInteractions.forEach(interaction => {
        const bookId = interaction.bookId._id.toString();
        
        if (!excludeBookIds.includes(bookId)) {
            if (!bookScores[bookId]) {
                bookScores[bookId] = {
                    book: interaction.bookId,
                    score: 0
                };
            }

          // Weight by interaction type
            const weight = this.getInteractionWeight(interaction.type, interaction.rating);
            bookScores[bookId].score += weight;
        }
    });

    // Sort by score and return top books
    return Object.values(bookScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.book);
  }

  /**
   * Content-Based Filtering: Recommend similar books based on genres, authors
   */
  async getContentBasedRecommendations(user, excludeBookIds, limit) {
    // Get user's favorite genres and authors from interactions
    const userInteractions = await interactionModel.find({ 
        userId: user._id,
        type: { $in: ['purchase', 'rating', 'favorite'] }
    }).populate('bookId');

    const genreCount = {};
    const authorCount = {};

    userInteractions.forEach(interaction => {
      if (interaction.bookId) {
        // Count genres
        interaction.bookId.genres.forEach(genre => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
        
        // Count authors
        const author = interaction.bookId.author;
        authorCount[author] = (authorCount[author] || 0) + 1;
      }
    });

    // Get top genres and authors
    const topGenres = Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .slice(0, 5);
    
    const topAuthors = Object.keys(authorCount)
      .sort((a, b) => authorCount[b] - authorCount[a])
      .slice(0, 3);

    // Combine with user preferences
    const preferredGenres = [...new Set([...topGenres, ...(user.preferredGenres || [])])];
    const favoriteAuthors = [...new Set([...topAuthors, ...(user.favoriteAuthors || [])])];

    // Find books matching these preferences
    const books = await bookModel.find({
      _id: { $nin: excludeBookIds },
      $or: [
        { genres: { $in: preferredGenres } },
        { author: { $in: favoriteAuthors } }
      ]
    }).limit(limit * 2); // Get more than needed for scoring

    // Score books based on matches
    const scoredBooks = books.map(book => {
      let score = 0;
      
      // Score by genre match
      book.genres.forEach(genre => {
        if (preferredGenres.includes(genre)) {
          score += 1;
        }
      });
      
      // Score by author match
      if (favoriteAuthors.includes(book.author)) {
        score += 2;
      }
      
      // Bonus for high ratings
      score += book.averageRating * 0.5;
      
      return { book, score };
    });

    return scoredBooks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.book);
  }

  /**
   * Get popular/trending books
   */
  async getPopularBooks(excludeBookIds, limit) {
    return await bookModel.find({
      _id: { $nin: excludeBookIds }
    })
    .sort({
      totalPurchases: -1, 
      averageRating: -1,
      totalViews: -1 
    })
    .limit(limit);
  }

  /**
   * Get new releases
   */
  async getNewReleases(excludeBookIds, limit) {
    return await bookModel.find({
      _id: { $nin: excludeBookIds }
    })
    .sort({ createdAt: -1 })
    .limit(limit);
  }

  /**
   * Get similar books based on a specific book
   */
  async getSimilarBooks(bookId, limit = 5) {
    const book = await bookModel.findById(bookId);
    
    if (!book) {
      throw new Error('bookModel not found');
    }

    // Find books with similar genres or same author
    const similarBooks = await bookModel.find({
      _id: { $ne: bookId },
      $or: [
        { genres: { $in: book.genres } },
        { author: book.author }
      ]
    }).limit(limit * 2);

    // Score by similarity
    const scoredBooks = similarBooks.map(similarBook => {
      let score = 0;
      
      // Score by genre overlap
      const genreOverlap = similarBook.genres.filter(g => 
        book.genres.includes(g)
      ).length;
      score += genreOverlap * 2;
      
      // Bonus for same author
      if (similarBook.author === book.author) {
        score += 5;
      }
      
      // Factor in ratings
      score += similarBook.averageRating * 0.3;
      
      return { book: similarBook, score };
    });

    return scoredBooks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.book);
  }

  /**
   * Helper: Add or update book score
   */
  addOrUpdateScore(scoredBooks, book, score) {
    const bookId = book._id.toString();
    
    if (scoredBooks.has(bookId)) {
      scoredBooks.get(bookId).score += score;
    } else {
      scoredBooks.set(bookId, { book, score });
    }
  }

  /**
   * Helper: Get weight for interaction type
   */
  getInteractionWeight(type, rating = null) {
    const weights = {
      'favorite': 5,
      'purchase': 4,
      'rating': rating || 3,
      'cart': 2,
      'view': 1
    };
    
    return weights[type] || 1;
  }
}

export default new RecommendationService();