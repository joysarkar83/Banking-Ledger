import { Router } from "express";
import { create, getAllAccounts } from "../controllers/account.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const accountRouter = Router();

// /api/account/create
accountRouter.post("/create", verifyToken, create);

// /api/account/all-accounts
accountRouter.get("/allAccounts", verifyToken, getAllAccounts);

export default accountRouter;