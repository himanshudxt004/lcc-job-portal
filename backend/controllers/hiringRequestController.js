const HiringRequest = require('../models/HiringRequest');

function parseSkills(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

/* ---------- POST /api/hiring-requests ---------- */
exports.create = async (req, res, next) => {
  try {
    const {
      companyName, contactName, email, phone,
      rolesNeeded, headcount, industry, location, budget, message, type
    } = req.body;

    const doc = await HiringRequest.create({
      companyName,
      contactName,
      email,
      phone:       phone || '',
      rolesNeeded: rolesNeeded || '',
      headcount:   headcount || '',
      industry:    industry || '',
      location:    location || '',
      budget:      budget || '',
      message:     message || '',
      type:        type === 'consultation' ? 'consultation' : 'hiring',
      employerId:  req.user && req.user.role === 'employer' ? req.user._id : null
    });

    res.status(201).json({ ok: true, message: 'Request submitted. Our team will contact you shortly.', request: doc });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/hiring-requests/mine (employer) ---------- */
exports.mine = async (req, res, next) => {
  try {
    const requests = await HiringRequest.find({ employerId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ ok: true, requests });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/hiring-requests (admin) ---------- */
exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type)   filter.type   = req.query.type;

    const requests = await HiringRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('employerId', 'name email company phone');

    res.json({ ok: true, requests });
  } catch (err) {
    next(err);
  }
};

/* ---------- PATCH /api/hiring-requests/:id/status (admin) ---------- */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'in_progress', 'closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ ok: false, message: 'Invalid status.' });
    }

    const doc = await HiringRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ ok: false, message: 'Request not found.' });
    }

    res.json({ ok: true, message: 'Status updated.', request: doc });
  } catch (err) {
    next(err);
  }
};
