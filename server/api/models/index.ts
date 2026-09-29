import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: String,
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    avatar: String,
    techStack: [String],
    interests: [String],
    refreshHash: String,
  },
  { timestamps: true },
);
const issueSchema = new mongoose.Schema(
  {
    title: String,
    repository: String,
    language: String,
    labels: [String],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    stars: Number,
    description: String,
    url: String,
    githubId: { type: Number, unique: true, sparse: true },
    source: { type: String, default: "sample" },
    number: Number,
    comments: Number,
    state: String,
    externalUpdatedAt: Date,
    author: String,
    assigned: Boolean,
  },
  { timestamps: true },
);
const contributionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    status: {
      type: String,
      enum: ["saved", "in progress", "submitted", "merged"],
      default: "saved",
    },
  },
  { timestamps: true },
);
contributionSchema.index({ user: 1, issue: 1 }, { unique: true });
export type UserDocument = mongoose.HydratedDocument<
  mongoose.InferSchemaType<typeof userSchema>
>;
export const User = mongoose.model("User", userSchema);
export const Issue = mongoose.model("Issue", issueSchema);
export const Contribution = mongoose.model("Contribution", contributionSchema);
