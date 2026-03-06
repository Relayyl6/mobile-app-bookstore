// ============================================
// UPDATED RECOMMENDATION ROUTES
// Aligned with new structure
// ============================================

// routes/recommendation.routes.js

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import recommendationService from '../services/recommendation.service.js';

const recommendationRouter = Router();

/**
 * @route   GET /api/v1/recommendations/personalized
 * @desc    Get personalized recommendations for logged-in user
 * @access  Private
 * @query   limit (default: 10)
 */
recommendationRouter.get("/personalized", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    
    const recommendations = await recommendationService.getRecommendations(userId, limit);
    
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/recommendations/similar/:bookId
 * @desc    Get books similar to a specific book
 * @access  Public
 * @query   limit (default: 5)
 */
recommendationRouter.get("/:bookId/similar", async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    const similarBooks = await recommendationService.getSimilarBooks(bookId, limit);
    
    res.json({
      success: true,
      count: similarBooks.length,
      similarBooks
    });
  } catch (error) {
    console.error('Error getting similar books:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/recommendations/popular
 * @desc    Get popular/trending books
 * @access  Public
 * @query   limit (default: 10)
 */
recommendationRouter.get("/popular", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const popularBooks = await recommendationService.getPopularBooks([], limit);
    
    res.json({
      success: true,
      count: popularBooks.length,
      popularBooks
    });
  } catch (error) {
    console.error('Error getting popular books:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/recommendations/new
 * @desc    Get new releases
 * @access  Public
 * @query   limit (default: 10)
 */
recommendationRouter.get("/new", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const newBooks = await recommendationService.getNewReleases([], limit);
    
    res.json({
      success: true,
      count: newBooks.length,
      newBooks
    });
  } catch (error) {
    console.error('Error getting new releases:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/recommendations/trending
 * @desc    Get trending books based on recent activity
 * @access  Public
 * @query   limit (default: 10), days (default: 7)
 */
recommendationRouter.get("/trending", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;
    
    const trendingBooks = await recommendationService.getTrendingBooks([], limit, days);
    
    res.json({
      success: true,
      count: trendingBooks.length,
      trendingBooks
    });
  } catch (error) {
    console.error('Error getting trending books:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/recommendations/genre/:genre
 * @desc    Get books by genre
 * @access  Public
 * @query   limit (default: 10)
 */
recommendationRouter.get("/genre/:genre", async (req, res, next) => {
  try {
    const { genre } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const books = await recommendationService.getBooksByGenre(genre, [], limit);
    
    res.json({
      success: true,
      genre,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Error getting books by genre:', error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/recommendations/author/:author
 * @desc    Get books by author
 * @access  Public
 * @query   limit (default: 10)
 */
recommendationRouter.get("/author/:author", async (req, res, next) => {
  try {
    const { author } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const books = await recommendationService.getBooksByAuthor(author, [], limit);
    
    res.json({
      success: true,
      author,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Error getting books by author:', error);
    next(error);
  }
});

export default recommendationRouter;

// ============================================
// HOW TO USE IN YOUR MAIN APP
// ============================================

/*
// app.js or server.js

import recommendationRouter from './routes/recommendation.routes.js';

// Mount the router
app.use('/api/v1/recommendations', recommendationRouter);

// Now you have these endpoints:
// GET /api/v1/recommendations/personalized      - Personalized for user
// GET /api/v1/recommendations/similar/:bookId   - Similar to a book
// GET /api/v1/recommendations/popular           - Popular books
// GET /api/v1/recommendations/new               - New releases
// GET /api/v1/recommendations/trending          - Trending books
// GET /api/v1/recommendations/genre/:genre      - By genre
// GET /api/v1/recommendations/author/:author    - By author
*/