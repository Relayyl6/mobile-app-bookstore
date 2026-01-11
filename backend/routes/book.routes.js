import { Router } from 'express';
import authMiddleware from "../middleware/auth.middleware.js";
import { createBook } from '../controller/book.controller.js'

const bookRouter = Router()

// create a book
bookRouter.post('/', authMiddleware, createBook)

// get all books 
bookRouter.get('/', (req, res) => {
    res.send({ message: "Get all books" })
})



export default bookRouter