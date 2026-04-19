import { Router } from "express";
import { register, login, logout, getCurrentUser, editProfile } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const authRouter = Router();

// /api/auth/register
authRouter.post("/register", register);

// /api/auth/login
authRouter.post("/login", login);

// /api/auth/me
authRouter.get("/me", verifyToken, getCurrentUser);

// /api/auth/edit-profile
authRouter.put("/edit-profile", verifyToken, editProfile);

// /api/auth/logout
authRouter.post("/logout", logout);

export default authRouter;