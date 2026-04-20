import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

const explicitAllowedOrigins = [
	"http://localhost:5173",
	"https://banking-ledger-alpha.vercel.app",
	process.env.FRONTEND_ORIGIN,
].filter(Boolean);

const vercelPreviewRegex = /^https:\/\/banking-ledger-.*\.vercel\.app$/;

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) {
			callback(null, true);
			return;
		}

		const isAllowed = explicitAllowedOrigins.includes(origin) || vercelPreviewRegex.test(origin);
		callback(null, isAllowed);
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(cors(corsOptions));
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