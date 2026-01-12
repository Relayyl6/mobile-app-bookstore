import { Router } from 'express';
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getNewBooks, getPopularBooks, getRecommendedBook, getSimilarBooks } from '../controller/book.controller.js';

const recommendationRouter = Router()

// GET /api/recommendations
//  * Get personalized recommendations for logged-in user
recommendationRouter.get("/", authMiddleware, getRecommendedBook)

// GET /api/recommendations/similar/:bookId
//  * Get books similar to a specific book
recommendationRouter.get("/similar/:bookId", authMiddleware, getSimilarBooks)

// GET /api/recommendations/popular
//  * Get popular/trending books
recommendationRouter.get("/popular", authMiddleware, getPopularBooks)

//  GET /api/recommendations/new
//  * Get new releases
recommendationRouter.get("/new", authMiddleware, getNewBooks)

export default recommendationRouter