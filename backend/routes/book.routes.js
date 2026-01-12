import { Router } from 'express';
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createBook, getBooks, deleteBook, updateBook, incrementBookViews, incrementBookPurchases, addOrUpdateRating, deleteRating, getSingleBook } from '../controller/book.controller.js'
import { manualCleanup } from '../lib/cron.js';

const bookRouter = Router()

// create a book
bookRouter.post('/', authMiddleware, createBook)

// get all books
bookRouter.get('/', authMiddleware, getBooks)

// delete a book
bookRouter.delete("/:id", authMiddleware, deleteBook)

// update a book
bookRouter.put("/:id", authMiddleware, updateBook)

// get a single book
bookRouter.get("/:id", authMiddleware, getSingleBook)



// helper function for book recommendation algorithm
// when a user views the full details of a book
bookRouter.post("/views/:id", authMiddleware, incrementBookViews)

bookRouter.post("/purchase/:id", authMiddleware, incrementBookPurchases)

bookRouter.post("/rating", authMiddleware, addOrUpdateRating)

bookRouter.delete("/rating/:bookId", authMiddleware, deleteRating)

bookRouter.post('/admin/cleanup-preferences', authMiddleware, manualCleanup);

export default bookRouter