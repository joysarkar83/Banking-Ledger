import { Router } from "express";
import { verifySystemUser, verifyToken } from "../middlewares/auth.middleware.js";
import { transfer, deposit, getBalance } from "../controllers/transaction.controller.js";

const transactionRouter = Router();

// /api/transaction/get-balance
transactionRouter.post("/get-balance", verifyToken, getBalance);

// /api/transaction/transfer
transactionRouter.post("/transfer", verifyToken, transfer);

// /api/transaction/deposit
transactionRouter.post("/deposit", verifySystemUser, deposit);

export default transactionRouter;