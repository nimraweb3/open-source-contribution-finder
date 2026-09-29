import type { RequestHandler } from "express";
import mongoose from "mongoose";
import { createHmac } from "node:crypto";
import { ipKeyGenerator } from "express-rate-limit";

const schema = new mongoose.Schema({
  _id: String,
  hits: { type: Number, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
const Counter = mongoose.model("RateLimitCounter", schema);

// Fixed windows shared by every API instance. Raw client IPs are never stored.
export function rateLimit(
  bucket: string,
  limit: number,
  windowMs: number,
): RequestHandler {
  return async (req, res, next) => {
    const now = Date.now();
    const reset = (Math.floor(now / windowMs) + 1) * windowMs;
    const identity = createHmac("sha256", process.env.JWT_SECRET!)
      .update(ipKeyGenerator(req.ip || "unknown"))
      .digest("hex");
    const id = `${bucket}:${identity}:${Math.floor(now / windowMs)}`;
    try {
      const increment = () =>
        Counter.findOneAndUpdate(
          { _id: id },
          { $inc: { hits: 1 }, $setOnInsert: { expiresAt: new Date(reset) } },
          { upsert: true, returnDocument: "after" },
        );
      let counter;
      try {
        counter = await increment();
      } catch (error) {
        if ((error as { code?: number }).code !== 11000) throw error;
        counter = await increment();
      }
      if (counter!.hits > limit) {
        res.set("Retry-After", String(Math.ceil((reset - now) / 1000)));
        res
          .status(429)
          .json({ message: "Too many requests. Please try again shortly." });
        return;
      }
      next();
    } catch {
      res
        .status(503)
        .json({
          message: "The service is temporarily unavailable. Please try again.",
        });
    }
  };
}
