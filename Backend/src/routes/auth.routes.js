import { Router } from "express";
import { register, login, logout, getCurrentUser, editProfile, registerVerifyOTP, loginVerifyOTP } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const authRouter = Router();

// /api/auth/register
authRouter.post("/register", register);

// /api/auth/register-verify-otp
authRouter.post("/register-verify-otp", registerVerifyOTP);

// /api/auth/login
authRouter.post("/login", login);

// /api/auth/login-verify-otp
authRouter.post("/login-verify-otp", loginVerifyOTP);

// /api/auth/me
authRouter.get("/me", verifyToken, getCurrentUser);

// /api/auth/edit-profile
authRouter.put("/edit-profile", verifyToken, editProfile);

// /api/auth/logout
authRouter.post("/logout", logout);

export default authRouter;