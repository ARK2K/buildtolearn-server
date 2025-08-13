const Challenge = require('../models/Challenge');
const { cloudinary } = require('../utils/cloudinary');

const FALLBACK_IMAGE_URL = process.env.FALLBACK_IMAGE_URL;

const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (err) {
    console.error('Error fetching challenge:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      level,
      htmlTemplate,
      cssTemplate,
      jsTemplate,
      imageBase64
    } = req.body;

    let imageUrl = FALLBACK_IMAGE_URL; // default fallback
    if (imageBase64) {
      const uploadedImage = await cloudinary.uploader.upload(imageBase64, {
        folder: 'buildtolearn/challenges',
      });
      imageUrl = uploadedImage.secure_url;
    }

    const challenge = await Challenge.create({
      title,
      description,
      level,
      htmlTemplate,
      cssTemplate,
      jsTemplate,
      imageUrl,
    });

    res.status(201).json(challenge);
  } catch (err) {
    console.error('Error creating challenge:', err);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
};

module.exports = {
  getChallenges,
  getChallengeById,
  createChallenge
};