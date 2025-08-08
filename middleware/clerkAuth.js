require('dotenv').config();
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

// Ensure Clerk secret key is set
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('Missing Clerk Secret Key. Please set CLERK_SECRET_KEY in your .env file');
}

// Middleware to protect routes using Clerk JWT
const requireClerkAuth = ClerkExpressWithAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
  onError: (err, req, res, next) => {
    console.error('Clerk auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  },
});

module.exports = { requireClerkAuth };