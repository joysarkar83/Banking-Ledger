import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Account",
		required: true,
		index: true,
        immutable: true,
	},
    amount: {
        type: Number,
        required: [true, "Amount is required!"],
        immutable: true,
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: true,
        index: true,
        immutable: true,
    },
    type: {
        type: String,
        enum: {
            values: ["DEBIT", "CREDIT"],
            message: "Type must be either DEBIT or CREDIT!",
        },
        required: [true, "Type is required!"],
        immutable: true,
    },
});

function preventLedgerModification() {
    throw new Error("Ledger entries cannot be modified or deleted!");
}

ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

const ledgerModel = mongoose.model("Ledger", ledgerSchema);

export default ledgerModel;