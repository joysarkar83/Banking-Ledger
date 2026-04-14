import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const authRouter = Router();

// /api/auth/register
authRouter.post("/register", register);

// /api/auth/login
authRouter.post("/login", login);

export default authRouter;