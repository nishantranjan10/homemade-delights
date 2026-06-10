import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// A short-lived one-time code used to authorize sensitive admin actions
// (e.g. changing username/password). The code itself is stored hashed.
const verificationCodeSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    purpose: { type: String, required: true, default: 'account-update' },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: Mongo auto-removes the document once expiresAt passes.
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

verificationCodeSchema.statics.hashCode = (code) => bcrypt.hash(code, 8);

verificationCodeSchema.methods.verify = function (code) {
  return bcrypt.compare(code, this.codeHash);
};

export default mongoose.model('VerificationCode', verificationCodeSchema);
