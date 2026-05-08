const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify Bearer JWT and attach user to req.
 * Expects header:  Authorization: Bearer <token>
 */
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, message: 'Not authorized — token missing.' });
    }

    const token = header.slice(7).trim();
    if (!token) {
      return res.status(401).json({ ok: false, message: 'Not authorized — token missing.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ ok: false, message: 'Not authorized — invalid or expired token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ ok: false, message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };
