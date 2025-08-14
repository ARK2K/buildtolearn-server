const express = require("express");
const upload = require("../middleware/upload");
const {
  getChallenges,
  getChallengeById,
  createChallenge,
} = require("../controllers/challengeController");

const router = express.Router();

router.get("/", getChallenges);
router.get("/:id", getChallengeById);
router.post("/", upload.single("referenceImage"), createChallenge);

module.exports = router;