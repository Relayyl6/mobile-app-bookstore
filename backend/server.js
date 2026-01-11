import cookieParser from "cookie-parser";
import express from "express";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import bookRouter from "./routes/book.routes.js";
import { connectToDatabse } from "./db/db.js";
import errorMiddleware from "./middleware/error.middleware.js";
import authMiddleware from "./middleware/auth.middleware.js";

const app = express()

app.use(cookieParser());
app.use(express.json());
// app.use(mongoose);

app.use(errorMiddleware);
app.use(authMiddleware);

app.use('/api/v1/store', userRouter);
app.use('/api/v1/books', bookRouter);
// app.use('/api/v1/user', appRouter);

app.post("/api/health", (req, res) => {
    res.status.json({
        status: "Backed is up and running"
    })
})

connectToDatabse().then(() => {
    app.listen(PORT, (req, res) => {
        console.log(`Server is running on port: localhost:${PORT}`)
    })
})