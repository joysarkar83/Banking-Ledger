import accountModel from "../models/account.model.js";
import transactionModel from "../models/transaction.model.js";
import userModel from "../models/user.model.js";
import { createTransaction, sendAppropriateEmails, validateIdempotency } from "../utils/transaction.utils.js";

// /api/transaction/get-balance
export const getBalance = async (req, res) => {
    const { accountId } = req.body;
    const user = req.user;

    const account = await accountModel.find({ $and: [{ user: user._id }, { _id: accountId }] });
    
    if (!account || account.length === 0) {
        return res.status(404).json({ message: "Account not found!" });
    }
    
    try {
        const balance = await account[0].getBalance();
        res.status(200).json({ balance: balance });
    } catch (error) {
        console.error("Error fetching balance:", error);
        return res.status(500).json({ message: "An error occurred while fetching the balance." });
    }
}

// /api/transaction/transfer
export const transfer = async (req, res) => {
    const {fromAccount, toAccount, amount, idempotencyKey } = req.body;
    const fromUser = req.user;

    //  ------------------------ Validating Accounts ------------------------
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message:
                "fromAccount, toAccount, amount, and idempotencyKey are required!",
        });
    }

    
    const fromAcc = await accountModel.findById(fromAccount);
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

    //  ------------------------ Validating Idempotency ------------------------
    const idempotencyError = await validateIdempotency(idempotencyKey, res);
    if (idempotencyError) {
        return;
    }

    //  ------------------------ Validating Sufficient Funds ------------------------
    const balance = await fromAcc.getBalance();

    if (balance < amount) {
        return res
            .status(400)
            .json({ message: "Insufficient funds!" });
    }

    //  ------------------------ Fetching Account Name and Email ------------------------
    const toUser = await userModel.findById(toAcc.user).select("name email");

    //  ------------------------ Creating Transaction ------------------------
    try {
        const result = await createTransaction(fromAccount, toAccount, amount, idempotencyKey, res);
        sendAppropriateEmails(true, fromUser.email, fromUser.name, toUser.email, toUser.name, amount);
        return res.status(201).json({
            message: "Transaction completed successfully.",
            transaction: result.transaction,
        });
    } catch (error) {
        console.error("Error processing transaction:", error);
        sendAppropriateEmails(false, fromUser.email, fromUser.name, toUser.email, toUser.name, amount);
        return res.status(500).json({
            message: "An error occurred while processing the transaction.",
        });
    }
};

// /api/transaction/deposit
export const deposit = async (req, res) => {
    const { toAccount, amount, idempotencyKey } = req.body || {};
    const systemUser = req.user;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount, and idempotencyKey are required for initial transaction!",
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

    if (!toUser || !systemUser) {
        return res.status(404).json({
            message: "User for system or recipient account was not found!",
        });
    }

    //  ------------------------ Creating Initial Transaction ------------------------
    try {
        const result = await createTransaction(systemAcc._id, toAccount, amount, idempotencyKey, res);
        sendAppropriateEmails(true, systemUser.email, systemUser.name, toUser.email, toUser.name, amount);
        return res.status(201).json({
            message: "Initial transaction completed successfully.",
            transaction: result.transaction,
        });
    } catch (error) {
        console.error("Error processing initial transaction:", error);
        sendAppropriateEmails(false, systemUser.email, systemUser.name, toUser.email, toUser.name, amount);
        return res.status(500).json({
            message: "An error occurred while processing the initial transaction.",
        });
    }
}

// /api/transaction/transaction-history
export const getTransactionHistory = async (req, res) => {
    const { accountId } = req.body;
    const user = req.user;
    
    const account = await accountModel.find({ $and: [{ user: user._id }, { _id: accountId }] });
    if (!account || account.length === 0) {
        return res.status(404).json({ message: "Account not found!" });
    }

    try {
        const transactions = await transactionModel.find({ $or: [{ fromAccount: accountId }, { toAccount: accountId }] }).sort({ createdAt: -1 });
        res.status(200).json({ transactions: transactions });
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return res.status(500).json({ message: "An error occurred while fetching the transaction history." });
    }
}