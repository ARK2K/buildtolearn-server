const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

const requireClerkAuth = ClerkExpressWithAuth({
  onError: (err, req, res, next) => {
    console.error('Clerk auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  },
});

module.exports = { requireClerkAuth };