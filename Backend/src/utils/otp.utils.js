import bcrypt from "bcryptjs";
import otpModel from "../models/otp.model.js";

export const generateAndSaveOTP = async (email, purpose = "LOGIN") => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await otpModel.deleteMany({
        email: String(email).toLowerCase(),
        purpose,
    });

    await otpModel.create({
        email: String(email).toLowerCase(),
        otpHash,
        purpose,
    });

    return otp;
}

export const verifyOTP = async (email, otp, purpose = "LOGIN") => {
    const otpRecord = await otpModel
        .findOne({ email: String(email).toLowerCase(), purpose })
        .sort({ createdAt: -1 });

    if (!otpRecord) {
        return false;
    }

    const isValid = await bcrypt.compare(String(otp), otpRecord.otpHash);
    if (!isValid) {
        otpRecord.attempts = (otpRecord.attempts || 0) + 1;
        if (otpRecord.attempts >= 5) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return false;
        }

        await otpRecord.save();
        return false;
    }

    await otpModel.deleteOne({ _id: otpRecord._id });
    return true;
}