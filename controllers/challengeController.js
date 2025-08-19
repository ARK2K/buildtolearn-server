const Challenge = require("../models/Challenge");
const cloudinary = require("../utils/cloudinary");

const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    console.error("Error fetching challenges:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    res.json(challenge);
  } catch (err) {
    console.error("Error fetching challenge:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      starterCode,
      targetHTML,
      targetCSS,
      targetJS,
      structureRules,
      cssRules,
      domRules,
    } = req.body;

    let referenceImage = "";
    let referenceImageId = "";

    // Upload if base64 string provided
    if (req.body.imageBase64) {
      const uploaded = await cloudinary.uploader.upload(req.body.imageBase64, {
        folder: "buildtolearn/challenges",
      });
      referenceImage = uploaded.secure_url;
      referenceImageId = uploaded.public_id;
    }

    // Upload if multer file provided
    if (req.file && req.file.path) {
      referenceImage = req.file.path;
      referenceImageId = req.file.filename || "";
    }

    const challenge = await Challenge.create({
      title,
      description,
      difficulty,
      starterCode,
      targetHTML,
      targetCSS,
      targetJS,
      structureRules,
      cssRules,
      domRules,
      ...(referenceImage && { referenceImage }),
      ...(referenceImageId && { referenceImageId }),
    });

    res.status(201).json(challenge);
  } catch (err) {
    console.error("Error creating challenge:", err);
    res.status(500).json({ error: "Failed to create challenge" });
  }
};

module.exports = {
  getChallenges,
  getChallengeById,
  createChallenge,
};