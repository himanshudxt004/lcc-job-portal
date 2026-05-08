const Job         = require('../models/Job');
const Application = require('../models/Application');

/* ---------- GET /api/jobs ---------- */
/*  Public listing with optional ?search, ?location, ?industry, ?type, ?page, ?limit */
exports.list = async (req, res, next) => {
  try {
    const {
      search   = '',
      location = '',
      industry = '',
      type     = '',
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

    const pageNum  = Math.max(parseInt(page, 10)  || 1, 1);
    const pageSize = Math.min(parseInt(limit, 10) || 20, 100);

    const [items, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .populate('employerId', 'name company email'),
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

/* ---------- GET /api/jobs/:id ---------- */
exports.getOne = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name company email phone');
    if (!job) {
      return res.status(404).json({ ok: false, message: 'Job not found.' });
    }
    res.json({ ok: true, job });
  } catch (err) {
    next(err);
  }
};

/* ---------- POST /api/jobs (employer) ---------- */
exports.create = async (req, res, next) => {
  try {
    const {
      title, company, location, salary, description,
      type, industry, experience, skills
    } = req.body;

    const job = await Job.create({
      title,
      company:    company || req.user.company || req.user.name,
      location,
      salary,
      description,
      type,
      industry,
      experience,
      skills: Array.isArray(skills)
        ? skills
        : (typeof skills === 'string' ? skills.split(',').map((s) => s.trim()).filter(Boolean) : []),
      employerId: req.user._id
    });

    res.status(201).json({ ok: true, message: 'Job posted.', job });
  } catch (err) {
    next(err);
  }
};

/* ---------- PUT /api/jobs/:id (owner-employer) ---------- */
exports.update = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ ok: false, message: 'Job not found.' });
    }
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ ok: false, message: 'Not your job posting.' });
    }

    const fields = ['title', 'company', 'location', 'salary', 'description',
      'type', 'industry', 'experience', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) job[f] = req.body[f];
    });

    if (req.body.skills !== undefined) {
      const s = req.body.skills;
      job.skills = Array.isArray(s)
        ? s
        : (typeof s === 'string' ? s.split(',').map((x) => x.trim()).filter(Boolean) : []);
    }

    await job.save();
    res.json({ ok: true, message: 'Job updated.', job });
  } catch (err) {
    next(err);
  }
};

/* ---------- DELETE /api/jobs/:id (owner-employer) ---------- */
exports.remove = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ ok: false, message: 'Job not found.' });
    }
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ ok: false, message: 'Not your job posting.' });
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

/* ---------- GET /api/jobs/employer/mine (employer dashboard) ---------- */
exports.mine = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ ok: true, jobs });
  } catch (err) {
    next(err);
  }
};
