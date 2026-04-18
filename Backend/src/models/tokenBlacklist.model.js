import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    }
}, { timestamps: true });

tokenBlacklistSchema.index({createdAt: 1}, {
    expireAfterSeconds: 60 * 60 * 24, // 24 hours
});

const tokenBlacklistModel = mongoose.model("TokenBlacklist", tokenBlacklistSchema);

export default tokenBlacklistModel;