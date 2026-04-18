import jwt from "jsonwebtoken";
import config from "../configs/config.js";
import userModel from "../models/user.model.js";
import tokenBlacklistModel from "../models/tokenBlacklist.model.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized access, token not found." });
        }

        const blacklistedToken = await tokenBlacklistModel.findOne({ token });
        if (blacklistedToken) {
            return res.status(401).json({ message: "Unauthorized access, token has been blacklisted." });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: "Unauthorized access, invalid token." });
        }
        
        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized access, invalid or expired token." });
    }
}

export const verifySystemUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized access, token not found." });
        }

        const blacklistedToken = await tokenBlacklistModel.findOne({ token });
        if (blacklistedToken) {
            return res.status(401).json({ message: "Unauthorized access, token has been blacklisted." });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select("+isSystemUser");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized access, invalid token." });
        }

        if (!user.isSystemUser) {
            return res.status(403).json({ message: "Forbidden access, system user only." });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized access, invalid or expired token." });
    }
}