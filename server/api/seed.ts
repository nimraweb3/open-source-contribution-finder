import "dotenv/config";
import mongoose from "mongoose";
import { Issue } from "./models/index.js";
await mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/contribution-finder",
);
const samples: [string, string, string, number, string][] = [
  [
    "facebook/react",
    "Improve error messages for invalid hook calls",
    "TypeScript",
    231000,
    "Beginner",
  ],
  [
    "vercel/next.js",
    "Add accessible labels to navigation examples",
    "TypeScript",
    132000,
    "Beginner",
  ],
  [
    "python/cpython",
    "Clarify pathlib documentation examples",
    "Python",
    66000,
    "Beginner",
  ],
  [
    "tailwindlabs/tailwindcss",
    "Expand responsive layout documentation",
    "CSS",
    86000,
    "Beginner",
  ],
  [
    "nodejs/node",
    "Improve test coverage for stream utilities",
    "JavaScript",
    110000,
    "Intermediate",
  ],
  [
    "rust-lang/rust",
    "Investigate compiler diagnostic edge cases",
    "Rust",
    101000,
    "Advanced",
  ],
  [
    "sveltejs/svelte",
    "Improve keyboard navigation in examples",
    "JavaScript",
    81000,
    "Intermediate",
  ],
  [
    "golang/go",
    "Add examples for HTTP middleware patterns",
    "Go",
    126000,
    "Intermediate",
  ],
  [
    "vuejs/core",
    "Document common reactivity patterns",
    "TypeScript",
    49000,
    "Beginner",
  ],
];
for (const [repository, title, language, stars, difficulty] of samples) {
  await Issue.updateOne(
    { repository, title },
    {
      $setOnInsert: {
        repository,
        title,
        language,
        stars,
        difficulty,
        labels:
          difficulty === "Beginner"
            ? ["good first issue", "documentation"]
            : ["help wanted", "enhancement"],
        description: `This is a sample contribution opportunity for ${repository}, provided for exploring Contribution-Finder. Start by reading the repository's contribution guidelines, setting up the project locally, and discussing your approach with a maintainer.\n\nSuggested scope: ${title.toLowerCase()}. Add or update relevant tests, keep the change focused, and describe your approach in the pull request.\n\nDemo listing: this is not a verified live GitHub issue. Follow the repository link to find current opportunities.`,
        url: `https://github.com/${repository}/issues`,
      },
    },
    { upsert: true },
  );
}
console.log("Seeded 9 sample listings. Existing data preserved.");
await mongoose.disconnect();
