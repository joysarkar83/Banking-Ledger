import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required!"],
        trim: true
    },
    mobileNo: {
        type: String,
        unique: [true, "Mobile number already exists!"],
        required: [true, "Mobile number is required!"],
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid mobile number!"]
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: [true, "Email already exists!"],
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address!"]
    },
    passwordHash: {
        type: String,
        required: [true, "Password is required!"],
        select: false
    },
    isSystemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("User", userSchema);

export default userModel;