import { Router } from "express";
import { create, getAllAccounts, forgotPin, resetPin } from "../controllers/account.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const accountRouter = Router();

// /api/account/create
accountRouter.post("/create", verifyToken, create);

// /api/account/all-accounts
accountRouter.get("/allAccounts", verifyToken, getAllAccounts);

// /api/account/forgot-pin
accountRouter.post("/forgot-pin", verifyToken, forgotPin);

// /api/account/reset-pin
accountRouter.post("/reset-pin", verifyToken, resetPin);

export default accountRouter;