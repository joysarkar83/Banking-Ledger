import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendRegistrationEmail } from "../services//email.service.js";
import config from "../configs/config.js";

// /api/auth/register
export const register = async (req, res) => {
    const { name, mobileNo, email, password } = req.body;

    if (!email || !name || !password || !mobileNo) {
        return res.status(400).json({ message: "Email, name, password, and mobile number are required!" });
    }

    const existingUser = await userModel.findOne({ $or: [{ email }, { mobileNo }] });
    if (existingUser) {
        return res.status(400).json({ message: "Email or mobile number already exists!" });
    }

    const currPasswordHash = await bcrypt.hash(password, 12);

    const user = await userModel.create({
        name,
        mobileNo,
        email,
        passwordHash: currPasswordHash
    });

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({ message: "User registered successfully!", user: { email, name, mobileNo } });
    
    await sendRegistrationEmail(user.email, user.name);
}

// /api/auth/login
export const login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    const user = await userModel.findOne({ email }).select("+passwordHash");

    if(!user){
        return res.status(400).json({ message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password!" });
    }

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ message: "Login successful!", user: { email: user.email, name: user.name, mobileNo: user.mobileNo } });
}

// /api/auth/logout
export const logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful!" });
}