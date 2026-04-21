import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  purpose: {
    type: String,
    enum: ['REGISTER', 'LOGIN', 'FORGOT_PASSWORD', 'FORGOT_PIN'],
    required: true,
    default: 'LOGIN',
  }
}, {
  timestamps: true,
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
otpSchema.index({ email: 1, purpose: 1 });

const otpModel = mongoose.model('Otp', otpSchema);

export default otpModel;