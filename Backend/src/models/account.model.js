import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import ledgerModel from "./ledger.model.js";

const accountSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		pin: {
			type: String,
			required: [true, "PIN is required!"],
			match: [/^\d{4}$/, "PIN must be a 4-digit number!"],
			select: false,
		},
		status: {
			type: String,
			enum: {
				values: ["ACTIVE", "FROZEN", "CLOSED"],
				message: "Status must be either ACTIVE, FROZEN, or CLOSED!",
			},
			default: "ACTIVE",
		},
		currency: {
			type: String,
			required: [true, "Currency is required!"],
			trim: true,
			uppercase: true,
			match: [
				/^[A-Z]{3}$/,
				"Currency must be a valid 3-letter ISO code!",
			],
			default: "INR",
		},
	},
	{
		timestamps: true,
	},
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.pre("save", async function handlePinHash() {
	if (!this.isModified("pin")) {
		return;
	}

	this.pin = await bcrypt.hash(this.pin, 10);
});

accountSchema.methods.verifyPin = async function verifyPin(rawPin) {
	if (!rawPin || !this.pin) {
		return false;
	}

	return bcrypt.compare(String(rawPin), this.pin);
}

accountSchema.methods.getBalance = async function () {
	const ledgers = await ledgerModel.aggregate([
		{ $match: { account: this._id } },
		{
			$group: {
				_id: null,
				totalDebit: { $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] } },
				totalCredit: { $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] } }
			},
		},
		{
			$project: {
				_id: 0,
				balance: { $subtract: ["$totalCredit", "$totalDebit"] }
			},
		}
	]);
	return ledgers[0]?.balance || 0;
}

const accountModel = mongoose.model("Account", accountSchema);

export default accountModel;
