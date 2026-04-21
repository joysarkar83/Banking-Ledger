import accountModel from "../models/account.model.js";
import { sendOTPEmail, sendPinResetSuccessEmail } from "../services/email.service.js";
import { generateAndSaveOTP, verifyOTP } from "../utils/otp.utils.js";

// /api/account/create
export const create = async (req, res) => {
    const { pin, status, currency } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized access, user not found." });
    }

    if (!pin || !/^\d{4}$/.test(String(pin))) {
        return res.status(400).json({ message: "A valid 4-digit PIN is required." });
    }

    const newAccount = await accountModel.create({
        user: userId,
        pin: String(pin),
        status,
        currency,
    });

    return res.status(201).json({ message: "Account created successfully.", account: newAccount._id });
};

// /api/account/allAccounts
export const getAllAccounts = async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized access, user not found." });
    }

    const accounts = await accountModel.find({ user: userId });

    return res.status(200).json({ accounts });
};

// /api/account/forgot-pin
export const forgotPin = async (req, res) => {
    const {accountId} = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized access, user not found." });
    }

    const account = await accountModel.findOne({ user: userId, _id: accountId }).select("+pin");

    if (!account) {
        return res.status(404).json({ message: "Account not found!" });
    }

    const otp = await generateAndSaveOTP(req.user.email, "FORGOT_PIN");
    await sendOTPEmail(req.user.email, req.user.name, otp);

    return res.status(200).json({ message: "OTP sent to registered email for PIN reset." });
}

// /api/account/reset-pin
export const resetPin = async (req, res) => {
    const { accountId, otp, newPin } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized access, user not found." });
    }

    if (!newPin || !/^\d{4}$/.test(String(newPin))) {
        return res.status(400).json({ message: "A valid 4-digit new PIN is required." });
    }

    if (!accountId || !otp) {
        return res.status(400).json({ message: "accountId and otp are required." });
    }

    const account = await accountModel.findOne({ user: userId, _id: accountId }).select("+pin");

    if (!account) {
        return res.status(404).json({ message: "Account not found!" });
    }

    const isValidOTP = await verifyOTP(req.user.email, otp, "FORGOT_PIN");
    if (!isValidOTP) {
        return res.status(400).json({ message: "Invalid or expired OTP!" });
    }

    account.pin = String(newPin);
    await account.save();
    await sendPinResetSuccessEmail(req.user.email, req.user.name, accountId);
    return res.status(200).json({ message: "PIN reset successfully!" });
}