const { validationResult } = require('express-validator');

/**
 * Run after express-validator chains. Aggregates errors into 400 response.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array()
    });
  }
  next();
}

module.exports = validate;
