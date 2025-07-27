import express from 'express';
import { requireClerkAuth } from '../middleware/clerkAuth.js';
import {
  createSubmission,
  getUserSubmissions,
} from '../controllers/submissionController.js';

const router = express.Router();

router.post('/', requireClerkAuth, createSubmission);
router.get('/user', requireClerkAuth, getUserSubmissions);

export default router;