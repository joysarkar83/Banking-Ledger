import { sendTransactionSuccessEmail, sendTransactionFailureEmail, } from "../services/email.service.js";

export const sendAppropriateEmails = (condition, fromUserEmail, fromUserName, toUserEmail, toUserName, amount, transactionId) => {
    if (condition) {
        sendTransactionSuccessEmail(fromUserEmail, fromUserName, amount, "DEBIT", transactionId);
        sendTransactionSuccessEmail(toUserEmail, toUserName, amount, "CREDIT", transactionId);
    } else {
        sendTransactionFailureEmail(fromUserEmail, fromUserName, amount, "DEBIT", transactionId);
    }
}