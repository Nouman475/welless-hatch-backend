import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    profilePhoto: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    twoFASecret: { type: String },
    twoFAEnabled: { type: Boolean },
    twoFAEnabledQr: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
