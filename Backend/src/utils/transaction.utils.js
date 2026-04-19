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

export const createTransaction = async (fromAccount, toAccount, amount, idempotencyKey) => {
    const session = await transactionModel.startSession();
    let newTransaction;

    try {
        newTransaction = await transactionModel.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
        });

        session.startTransaction();

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
        await transactionModel.updateOne(
            { _id: newTransaction._id },
            { status: "COMPLETED" },
            { session },
        );

        await session.commitTransaction();
        const completedTransaction = await transactionModel.findById(newTransaction._id);
        
        return {
            success: true,
            transaction: newTransaction._id ? completedTransaction : null,
        };
    } catch (error) {
        console.error("Error processing transaction:", error);
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        if (newTransaction?._id) {
            await transactionModel.findByIdAndUpdate(newTransaction._id, { status: "FAILED" });
        }

        return {
            success: false,
            transaction: newTransaction._id,
        };

        throw error;
    } finally {
        await session.endSession();
    }
}

export const sendAppropriateEmails = (condition, fromUserEmail, fromUserName, toUserEmail, toUserName, amount, transactionId) => {
    if (condition) {
        sendTransactionSuccessEmail(fromUserEmail, fromUserName, amount, "DEBIT", transactionId);
        sendTransactionSuccessEmail(toUserEmail, toUserName, amount, "CREDIT", transactionId);
    } else {
        sendTransactionFailureEmail(fromUserEmail, fromUserName, amount, "DEBIT", transactionId);
    }
}