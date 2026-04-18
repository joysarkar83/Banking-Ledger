import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller.js";

const authRouter = Router();

// /api/auth/register
authRouter.post("/register", register);

// /api/auth/login
authRouter.post("/login", login);

// /api/auth/logout
authRouter.post("/logout", logout);

export default authRouter;