import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRouter from "./routes/auth.routes.js";
import accountRouter from "./routes/account.routes.js";
import transactionRouter from "./routes/transaction.routes.js";

// Authentication Routes
app.use("/api/auth", authRouter);

// Account Routes
app.use("/api/account", accountRouter);

// Transaction Routes
app.use("/api/transaction", transactionRouter);

export default app;