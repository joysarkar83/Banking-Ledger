import userModel from "../models/user.model.js";
import tokenBlacklistModel from "../models/tokenBlacklist.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendOTPEmail, sendProfileEditedEmail, sendRegistrationEmail } from "../services/email.service.js";
import config from "../configs/config.js";
import { generateAndSaveOTP, verifyOTP } from "../utils/otp.utils.js";

const isProduction = process.env.NODE_ENV === "production";

const getCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 24 * 60 * 60 * 1000,
});

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

    const otp = await generateAndSaveOTP(email, "REGISTER");
    await sendOTPEmail(email, name, otp);

    return res.status(200).json({ message: "OTP sent to your email! Please verify to complete registration." });
}

// /api/auth/register-verify-otp
export const registerVerifyOTP = async (req, res) => {
    const { password, name, mobileNo, email, otp } = req.body;

    const isValid = await verifyOTP(email, otp, "REGISTER");
    if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP!" });
    }

    const currPasswordHash = await bcrypt.hash(password, 12);
    const user = await userModel.create({
        name,
        mobileNo,
        email,
        passwordHash: currPasswordHash
    });
    
    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, getCookieOptions());    
    
    await sendRegistrationEmail(user.email, user.name);
    return res.status(200).json({ message: "Registration successful!", user: { email: user.email, name: user.name, mobileNo: user.mobileNo } });
}

// /api/auth/login
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    const user = await userModel.findOne({ email }).select("+passwordHash");

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password!" });
    }

    // Send OTP to user's email
    const otp = await generateAndSaveOTP(user.email, "LOGIN");
    await sendOTPEmail(user.email, user.name, otp);

    return res.status(200).json({ message: "OTP sent to your email! Please verify to complete login.", userId: user._id });
}

// /api/auth/login-verify-otp
export const loginVerifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required!" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

    const isValid = await verifyOTP(user.email, otp, "LOGIN");
    if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP!" });
    }

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, getCookieOptions());
    return res.status(200).json({ message: "Login successful!", user: { email: user.email, name: user.name, mobileNo: user.mobileNo } });
};

// /api/auth/logout
export const logout = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({ message: "No token provided!" });
    }

    await tokenBlacklistModel.create({ token });

    const clearCookieOptions = getCookieOptions();
    delete clearCookieOptions.maxAge;
    res.clearCookie("token", clearCookieOptions);

    return res.status(200).json({ message: "Logout successful!" });
}

// /api/auth/me
export const getCurrentUser = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching current user:", error);
        return res.status(500).json({ message: "Internal server error!" });
    }
}

// /api/auth/edit-profile
export const editProfile = async (req, res) => {
    const userId = req.user._id;
    const { name, mobileNo, email, oldPassword, newPassword} = req.body;

    if (!name || !mobileNo || !email || !oldPassword) {
        return res.status(400).json({ message: "Name, email, mobile number, and old password is required!" });
    }

    try {
        const user = await userModel.findById(userId).select("+passwordHash");

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Incorrect password!" });
        }

        if (email !== user.email) {
            const existingEmailUser = await userModel.findOne({ email });
            if (existingEmailUser) {
                return res.status(400).json({ message: "Email already in use!" });
            }
            user.email = email;
        }

        if (mobileNo !== user.mobileNo) {
            const existingMobileUser = await userModel.findOne({ mobileNo });
            if (existingMobileUser) {
                return res.status(400).json({ message: "Mobile number already in use!" });
            }
            user.mobileNo = mobileNo;
        }

        if (name !== user.name) {
            user.name = name;
        }

        if (newPassword) {
            user.passwordHash = await bcrypt.hash(newPassword, 12);
        }

        await user.save();
        await sendProfileEditedEmail(user.email, user.name);
        return res.status(200).json({ message: "Profile updated successfully!" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Internal server error!" });
    }
}