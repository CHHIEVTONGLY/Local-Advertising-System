const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isSSO: { type: Boolean, default: false },
    profileUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    company: { type: String },
    contact: { type: String },
    role: {
      type: String,
      enum: ["admin", "publisher"],
      default: "publisher",
    },
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", User);

module.exports = userModel;
