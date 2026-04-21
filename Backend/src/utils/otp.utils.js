import bcrypt from "bcryptjs";
import otpModel from "../models/otp.model.js";

export const generateAndSaveOTP = async (email, purpose = "LOGIN") => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPurpose = String(purpose).toUpperCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await otpModel.deleteMany({
        email: normalizedEmail,
        purpose: normalizedPurpose,
    });
    
    const otpHash = await bcrypt.hash(otp, 10);
    await otpModel.create({
        email: normalizedEmail,
        otpHash,
        purpose: normalizedPurpose,
    });

    return otp;
}

export const verifyOTP = async (email, otp, purpose = "LOGIN") => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPurpose = String(purpose).toUpperCase();
    const normalizedOtp = String(otp).trim();

    const otpRecords = await otpModel
        .find({ email: normalizedEmail, purpose: normalizedPurpose })
        .sort({ createdAt: -1 });

    if (!otpRecords.length) {
        return false;
    }

    for (const otpRecord of otpRecords) {
        const isValid = await bcrypt.compare(normalizedOtp, otpRecord.otpHash);
        if (isValid) {
            await otpModel.deleteMany({ email: normalizedEmail, purpose: normalizedPurpose });
            return true;
        }
    }

    const latestOtpRecord = otpRecords[0];
    latestOtpRecord.attempts = (latestOtpRecord.attempts || 0) + 1;
    if (latestOtpRecord.attempts >= 5) {
        await otpModel.deleteMany({ email: normalizedEmail, purpose: normalizedPurpose });
        return false;
    }

    await latestOtpRecord.save();
    return false;
}