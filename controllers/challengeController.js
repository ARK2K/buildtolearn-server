const Challenge = require('../models/Challenge');

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
    const challenge = await Challenge.create(req.body);
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