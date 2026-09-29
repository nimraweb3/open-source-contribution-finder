import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema({
  state: { type: String, unique: true, required: true },
  binding: String,
  provider: String,
  verifier: String,
  nonce: String,
  returnTo: String,
  expiresAt: { type: Date, required: true, expires: 0 },
});
export const OAuthTransaction = mongoose.model(
  "OAuthTransaction",
  transactionSchema,
);
