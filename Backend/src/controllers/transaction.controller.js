import accountModel, { ACCOUNT_MAX_PIN_ATTEMPTS } from "../models/account.model.js";
import transactionModel from "../models/transaction.model.js";
import tokenBlacklistModel from "../models/tokenBlacklist.model.js";
import userModel from "../models/user.model.js";
import { createTransaction, validateIdempotency } from "../utils/transaction.utils.js";
import { sendAppropriateEmails } from "../utils/email.utils.js";

const MAX_PIN_ATTEMPTS = ACCOUNT_MAX_PIN_ATTEMPTS;

const getClearCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
});

const invalidateCurrentSession = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (token) {
        await tokenBlacklistModel.create({ token });
    }

    res.clearCookie("token", getClearCookieOptions());
};

const validatePinOrHandleLock = async (account, pin, req, res, invalidMessage = "Invalid PIN!") => {
    const isPinValid = await account.verifyPin(pin);

    if (isPinValid) {
        if (account.attempts > 0) {
            account.attempts = 0;
            await account.save();
        }
        return true;
    }

    account.attempts = Math.min((account.attempts || 0) + 1, MAX_PIN_ATTEMPTS);
    await account.save();

    if (account.attempts >= MAX_PIN_ATTEMPTS) {
        await invalidateCurrentSession(req, res);
        res.status(401).json({
            message: "Maximum PIN attempts exceeded. You have been logged out for security reasons.",
            forceLogout: true,
        });
        return false;
    }

    res.status(400).json({
        message: invalidMessage,
        attemptsLeft: MAX_PIN_ATTEMPTS - account.attempts,
    });
    return false;
};

// /api/transaction/get-balance
export const getBalance = async (req, res) => {
    const { accountId, pin } = req.body;
    const user = req.user;

    if (!accountId || !pin) {
        return res.status(400).json({ message: "accountId and pin are required!" });
    }

    const account = await accountModel.findOne({ user: user._id, _id: accountId }).select("+pin");

    if (!account) {
        return res.status(404).json({ message: "Account not found!" });
    }

    const pinOkay = await validatePinOrHandleLock(account, pin, req, res, "Invalid PIN!");
    if (!pinOkay) {
        return;
    }

    try {
        const balance = await account.getBalance();
        res.status(200).json({ balance: balance });
    } catch (error) {
        console.error("Error fetching balance:", error);
        return res.status(500).json({ message: "An error occurred while fetching the balance." });
    }
}

// /api/transaction/transfer
export const transfer = async (req, res) => {
    const { fromAccount, toAccount, pin, amount, idempotencyKey } = req.body;
    const fromUser = req.user;
    const numericAmount = Number(amount);

    //  ------------------------ Validating Accounts ------------------------
    if (!fromAccount || !toAccount || !pin || !amount || !idempotencyKey) {
        return res.status(400).json({
            message:
                "fromAccount, toAccount, pin, amount, and idempotencyKey are required!",
        });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number!" });
    }

    if (String(fromAccount) === String(toAccount)) {
        return res.status(400).json({ message: "fromAccount and toAccount must be different!" });
    }

    const fromAcc = await accountModel.findById(fromAccount).select("+pin");
    const toAcc = await accountModel.findById(toAccount);

    if (!fromAcc || !toAcc) {
        return res
            .status(404)
            .json({ message: "One or both accounts not found!" });
    }

    if (fromAcc.status !== "ACTIVE" || toAcc.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both accounts must be ACTIVE to perform a transaction!",
        });
    }

    if (String(fromAcc.user) !== String(fromUser._id)) {
        return res.status(403).json({ message: "You can only transfer from your own account!" });
    }

    const pinOkay = await validatePinOrHandleLock(fromAcc, pin, req, res, "Invalid PIN for fromAccount!");
    if (!pinOkay) {
        return;
    }

    //  ------------------------ Validating Idempotency ------------------------
    const idempotencyError = await validateIdempotency(idempotencyKey, res);
    if (idempotencyError) {
        return;
    }

    //  ------------------------ Validating Sufficient Funds ------------------------
    const balance = await fromAcc.getBalance();

    if (balance < numericAmount) {
        return res
            .status(400)
            .json({ message: "Insufficient funds!" });
    }

    //  ------------------------ Fetching Account Name and Email ------------------------
    const toUser = await userModel.findById(toAcc.user).select("name email");

    //  ------------------------ Creating Transaction ------------------------
    try {
        const result = await createTransaction(fromAccount, toAccount, numericAmount, idempotencyKey);
        sendAppropriateEmails(result.success, fromUser.email, fromUser.name, toUser.email, toUser.name, numericAmount, result.transaction._id);
        return res.status(201).json({message: "Transaction completed."});
    } catch (error) {
        console.error("Error processing transaction:", error);
        return res.status(500).json({
            message: "An error occurred while processing the transaction.",
        });
    }
};

// /api/transaction/deposit
export const deposit = async (req, res) => {
    const { toAccount, amount, idempotencyKey } = req.body;
    const systemUser = req.user;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount, and idempotencyKey are required for amount deposition!",
        });
    }

    // ------------------------ Validating To Account ------------------------
    const toAcc = await accountModel.findById(toAccount);

    if (!toAcc) {
        return res.status(404).json({ message: "To account not found!" });
    }

    if (toAcc.status !== "ACTIVE") {
        return res.status(400).json({
            message: "To account must be ACTIVE to perform a transaction!",
        });
    }

    // ------------------------ Validating Idempotency ------------------------
    const idempotencyError = await validateIdempotency(idempotencyKey, res);
    if (idempotencyError) {
        return idempotencyError;
    }

    const systemAcc = await accountModel.findOne({ user: systemUser._id });
    if (!systemAcc) {
        return res.status(404).json({ message: "System account not found!" });
    }

    // ------------------------ Fetching Account Name and Email ------------------------
    const toUser = await userModel.findById(toAcc.user).select("name email");
    
    //  ------------------------ Creating Initial Transaction ------------------------
    try {
        const result = await createTransaction(systemAcc._id, toAccount, amount, idempotencyKey);
        sendAppropriateEmails(result.success, systemUser.email, systemUser.name, toUser.email, toUser.name, amount, result.transaction._id);
        return res.status(201).json({ message: "Amount deposited successfully." });
    } catch (error) {
        console.error("Error processing initial transaction:", error);
        return res.status(500).json({
            message: "An error occurred while processing the initial transaction.",
        });
    }
}

// /api/transaction/transaction-history
export const getTransactionHistory = async (req, res) => {
    const { accountId, pin } = req.body;
    const user = req.user;

    if (!accountId || !pin) {
        return res.status(400).json({ message: "accountId and pin are required!" });
    }

    const account = await accountModel.findOne({ user: user._id, _id: accountId }).select("+pin");
    if (!account) {
        return res.status(404).json({ message: "Account not found!" });
    }

    const pinOkay = await validatePinOrHandleLock(account, pin, req, res, "Invalid PIN!");
    if (!pinOkay) {
        return;
    }

    try {
        const transactions = await transactionModel.find({ $or: [{ fromAccount: accountId }, { toAccount: accountId }] }).sort({ createdAt: -1 });
        res.status(200).json({ transactions: transactions });
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return res.status(500).json({ message: "An error occurred while fetching the transaction history." });
    }
}