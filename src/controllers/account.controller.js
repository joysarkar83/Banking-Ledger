import accountModel from "../models/account.model.js";

// /api/account/create
export const create = async (req, res) => {
    const { status, currency } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized access, user not found." });
    }

    const newAccount = await accountModel.create({
        user: userId,
        status,
        currency,
    });

    return res.status(201).json({ message: "Account created successfully.", account: newAccount });
};