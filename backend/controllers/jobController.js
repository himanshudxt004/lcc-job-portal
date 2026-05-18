const Job         = require('../models/Job');
const Application = require('../models/Application');

function parseSkills(skills) {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    return skills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/* ---------- GET /api/jobs ---------- */
exports.list = async (req, res, next) => {
  try {
    const {
      search   = '',
      location = '',
      industry = '',
      type     = '',
      featured = '',
      page     = 1,
      limit    = 20
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { company:     { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (industry) query.industry = { $regex: industry, $options: 'i' };
    if (type)     query.type     = type;
    if (featured === 'true') query.isFeatured = true;

    const pageNum  = Math.max(parseInt(page, 10)  || 1, 1);
    const pageSize = Math.min(parseInt(limit, 10) || 20, 100);

    const [items, total] = await Promise.all([
      Job.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .populate('postedBy', 'name'),
      Job.countDocuments(query)
    ]);

    res.json({
      ok: true,
      page: pageNum,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      jobs: items
    });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/jobs/admin/all (admin) ---------- */
exports.adminList = async (req, res, next) => {
  try {
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');
    res.json({ ok: true, jobs });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/jobs/:id ---------- */
exports.getOne = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email phone');
    if (!job) {
      return res.status(404).json({ ok: false, message: 'Job not found.' });
    }
    res.json({ ok: true, job });
  } catch (err) {
    next(err);
  }
};

/* ---------- POST /api/jobs (admin) ---------- */
exports.create = async (req, res, next) => {
  try {
    const {
      title, company, location, salary, description,
      type, industry, experience, skills, isFeatured, isActive
    } = req.body;

    const job = await Job.create({
      title,
      company:    company || 'LCC Partner',
      location,
      salary,
      description,
      type,
      industry,
      experience,
      skills: parseSkills(skills),
      postedBy:   req.user._id,
      isFeatured: isFeatured === true || isFeatured === 'true',
      isActive:   isActive !== false && isActive !== 'false'
    });

    res.status(201).json({ ok: true, message: 'Job published.', job });
  } catch (err) {
    next(err);
  }
};

/* ---------- PUT /api/jobs/:id (admin) ---------- */
exports.update = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ ok: false, message: 'Job not found.' });
    }

    const fields = ['title', 'company', 'location', 'salary', 'description',
      'type', 'industry', 'experience', 'isActive', 'isFeatured'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        if (f === 'isActive' || f === 'isFeatured') {
          job[f] = req.body[f] === true || req.body[f] === 'true';
        } else {
          job[f] = req.body[f];
        }
      }
    });

    if (req.body.skills !== undefined) {
      job.skills = parseSkills(req.body.skills);
    }

    await job.save();
    res.json({ ok: true, message: 'Job updated.', job });
  } catch (err) {
    next(err);
  }
};

/* ---------- DELETE /api/jobs/:id (admin) ---------- */
exports.remove = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ ok: false, message: 'Job not found.' });
    }

    await Promise.all([
      Job.deleteOne({ _id: job._id }),
      Application.deleteMany({ jobId: job._id })
    ]);

    res.json({ ok: true, message: 'Job deleted.' });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/jobs/employer/mine — deprecated ---------- */
exports.mine = async (req, res, next) => {
  res.status(403).json({
    ok: false,
    message: 'Employers cannot manage job listings. Please submit a hiring request instead.'
  });
};
