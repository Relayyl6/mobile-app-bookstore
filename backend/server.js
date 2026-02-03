import cookieParser from "cookie-parser";
import express from "express";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import bookRouter from "./routes/book.routes.js";
import { connectToDatabse } from "./db/db.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
// import cors from "cors"
import recommendationRouter from "./routes/recommendation.routes.js";
import { startHealthCheckJob, startPreferenceCleanupJob } from "./lib/cron.js";
import {setupDNS} from "./dns-resolver.js"
import { swaggerDocs } from "./docs/swagger.js";
import dotenv from "dotenv";

dotenv.config();

const app = express()

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors);

app.use(errorMiddleware);
// app.use(authMiddleware);

app.use("/api/v1/docs", swaggerDocs.serve, swaggerDocs.setup);

app.use('/api/v1/store', userRouter);
app.use('/api/v1/books', bookRouter);
// app.use('/api/v1/user', appRouter);
app.use('/api/v1/recommendations', recommendationRouter)

app.post("/api/health", (req, res) => {
    res.status(200).json({
        status: "Backed is up and running"
    })
})

// console.log("1️⃣ Starting server");
setupDNS()
// console.log("2️⃣ DNS setup done");
connectToDatabse().then(() => {
    app.listen(PORT, (req, res) => {
        startPreferenceCleanupJob()
        startHealthCheckJob()
        console.log(`Server is running on port: localhost:${PORT}`)
    })
})