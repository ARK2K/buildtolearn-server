const express = require('express');
const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const router = express.Router();

// GET all challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET challenge by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // ✅ Check if ID is valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const challenge = await Challenge.findById(id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    res.json(challenge);
  } catch (err) {
    console.error('Error in GET /:id', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;