import accountModel from "../models/account.model.js";

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