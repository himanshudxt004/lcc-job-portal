/**
 * Role-based gate. Use AFTER `protect`.
 * Example:  router.post('/', protect, requireRole('employer'), createJob);
 */
function requireRole(...allowed) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'Not authorized.' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: `Access denied. Required role: ${allowed.join(' or ')}.`
      });
    }
    next();
  };
}

module.exports = { requireRole };
