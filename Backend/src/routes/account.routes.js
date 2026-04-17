import { Router } from "express";
import { create } from "../controllers/account.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const accountRouter = Router();

// /api/account/create
accountRouter.post("/create", verifyToken, create);

export default accountRouter;