const jwt  = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/* ---------- POST /api/auth/signup ---------- */
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, company } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ ok: false, message: 'Admin accounts cannot be created via signup.' });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res.status(409).json({ ok: false, message: 'Email already registered.' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      phone:   phone   || '',
      company: role === 'employer' ? (company || '') : ''
    });
    await user.save();

    const token = signToken(user);

    res.status(201).json({
      ok: true,
      message: 'Account created.',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};

/* ---------- POST /api/auth/login ---------- */
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
    }

    // Optional role guard — if frontend specified a role, enforce it
    if (role && user.role !== role) {
      return res.status(403).json({
        ok: false,
        message: `This account is registered as ${user.role}, not ${role}. Please switch login type.`
      });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({
      ok: true,
      message: 'Welcome back.',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/auth/me ---------- */
exports.me = async (req, res, next) => {
  try {
    res.json({ ok: true, user: req.user.toJSON() });
  } catch (err) {
    next(err);
  }
};

/* ---------- PATCH /api/auth/profile ---------- */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, company, headline, location, skills } = req.body;
    const user = req.user;

    if (name !== undefined)     user.name     = name;
    if (phone !== undefined)    user.phone    = phone;
    if (headline !== undefined) user.headline = headline;
    if (location !== undefined) user.location = location;

    if (Array.isArray(skills)) {
      user.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      user.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (user.role === 'employer' && company !== undefined) {
      user.company = company;
    }

    await user.save();

    res.json({ ok: true, message: 'Profile updated.', user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};
