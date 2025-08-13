import express from "express";
import upload from "../middleware/upload.js";
import {
  getChallenges,
  getChallengeById,
  createChallenge,
  deleteChallenge,
} from "../controllers/challengeController.js";

const router = express.Router();

router.get("/", getChallenges);
router.get("/:id", getChallengeById);
router.post("/", upload.single("referenceImage"), createChallenge);
router.delete("/:id", deleteChallenge);

module.exports = router;