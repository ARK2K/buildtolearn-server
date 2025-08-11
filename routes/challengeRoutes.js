const express = require('express');
const { getChallenges, getChallengeById, createChallenge } = require('../controllers/challengeController');
const router = express.Router();

router.get('/', getChallenges);
router.get('/:id', getChallengeById);
router.post('/', createChallenge);

module.exports = router;