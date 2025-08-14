const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    starterCode: { type: String, required: true },
    targetHTML: { type: String, required: true },
    targetCSS: { type: String, required: true },
    targetJS: { type: String }, // Optional for DOM behavior tests

    // Reference image (stored in Cloudinary)
    referenceImage: {
      type: String,
      default: process.env.FALLBACK_IMAGE_URL || "", // Always have a fallback
    },
    referenceImageId: { type: String }, // Cloudinary public_id for easy deletion/update

    // Level 1: HTML structure rules
    structureRules: [
      {
        selector: { type: String, required: true },
        count: { type: Number, required: true },
      },
    ],

    // Level 2: CSS style rules
    cssRules: [
      {
        selector: { type: String, required: true },
        property: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],

    // Level 3: DOM behavior rules (JS-based interactions)
    domRules: [
      {
        description: { type: String, required: true }, // e.g., "Click button changes text to 'Hello'"
        testFunction: { type: String, required: true }, // JS test code as string
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);