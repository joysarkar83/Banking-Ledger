import transactionModel from "../models/transaction.model.js";
import ledgerModel from "../models/ledger.model.js";
import { sendTransactionSuccessEmail, sendTransactionFailureEmail, } from "../services/email.service.js";

export const validateIdempotency = async (idempotencyKey, res) => {
    const existingTransaction = await transactionModel.findOne({ idempotencyKey });

    if (existingTransaction) {
        if (existingTransaction.status === "COMPLETED") {
            return res.status(409).json({
                message:
                    "A transaction with this idempotency key already exists!",
            });
        } else if (existingTransaction.status === "PENDING") {
            return res.status(409).json({
                message:
                    "A transaction with this idempotency key is already in progress!",
            });
        } else if (existingTransaction.status === "FAILED") {
            return res.status(409).json({
                message: "A transaction with this idempotency key has failed!",
            });
        } else {
            return res.status(409).json({
                message:
                    "A transaction with this idempotency key already has already been reversed!",
            });
        }
    }

    return null;
}

export const createTransaction = async (fromAccount, toAccount, amount, idempotencyKey, res) => {
    const session = await transactionModel.startSession();
    session.startTransaction();
    try {
        const [newTransaction] = await transactionModel.create(
            [{ fromAccount, toAccount, amount, idempotencyKey, status: "PENDING" }],
            { session },
        );

        //  ------------------------ Creating Ledger Entries ------------------------
        await ledgerModel.create(
            [{ account: fromAccount, amount, transaction: newTransaction._id, type: "DEBIT" }],
            { session },
        );

        await ledgerModel.create(
            [{ account: toAccount, amount, transaction: newTransaction._id, type: "CREDIT" }],
            { session },
        );

        //  ------------------------ Updating Transaction Status ------------------------
        newTransaction.status = "COMPLETED";
        await newTransaction.save({ session });

        await session.commitTransaction();
        await session.endSession();

        return { success: true, transaction: newTransaction };
    } catch (error) {
        console.error("Error processing transaction:", error);
        await session.abortTransaction();
        await session.endSession();
        throw error;
    }
}

export const sendAppropriateEmails = (condition, fromUserEmail, fromUserName, toUserEmail, toUserName, amount) => {
    if (condition) {
        sendTransactionSuccessEmail(fromUserEmail, fromUserName, amount, "DEBIT", null,);
        sendTransactionSuccessEmail(toUserEmail, toUserName, amount, "CREDIT", null,);
    } else {
        sendTransactionFailureEmail(fromUserEmail, fromUserName, amount, "DEBIT", null,);
    }
}