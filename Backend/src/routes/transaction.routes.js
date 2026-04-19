import { Router } from "express";
import { verifySystemUser, verifyToken } from "../middlewares/auth.middleware.js";
import { transfer, deposit, getBalance, getTransactionHistory } from "../controllers/transaction.controller.js";

const transactionRouter = Router();

// /api/transaction/get-balance
transactionRouter.post("/get-balance", verifyToken, getBalance);

// /api/transaction/transfer
transactionRouter.post("/transfer", verifyToken, transfer);

// /api/transaction/deposit
transactionRouter.post("/deposit", verifySystemUser, deposit);

// /api/transaction/transaction-history
transactionRouter.post("/transaction-history", verifyToken, getTransactionHistory);

export default transactionRouter;