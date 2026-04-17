import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true,
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: [true, "Amount is required!"],
        min: [0, "Amount must be at least 0!"],
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status must be either PENDING, COMPLETED, FAILED, or REVERSED!",
        },
        default: "PENDING",
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency Key is required!"],
        unique: true,
        index: true,
    },
}, {
    timestamps: true,
});

const transactionModel = mongoose.model("Transaction", transactionSchema);

export default transactionModel;