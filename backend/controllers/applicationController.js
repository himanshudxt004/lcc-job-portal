const Application = require('../models/Application');
const Job         = require('../models/Job');

/* ---------- POST /api/apply ---------- */
/*  Body fields:  jobId, coverNote   (multipart 'resume' file optional but recommended) */
exports.apply = async (req, res, next) => {
  try {
    const { jobId, coverNote } = req.body;

    if (!jobId) {
      return res.status(400).json({ ok: false, message: 'jobId is required.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ ok: false, message: 'Job not found.' });
    }
    if (!job.isActive) {
      return res.status(400).json({ ok: false, message: 'Job is no longer accepting applications.' });
    }

    // Resume: prefer freshly uploaded; otherwise re-use user's stored resume
    let resumePath = '';
    if (req.file) {
      resumePath = '/uploads/' + req.file.filename;
      // Persist on user too
      req.user.resume = resumePath;
      await req.user.save();
    } else if (req.user.resume) {
      resumePath = req.user.resume;
    }

    if (!resumePath) {
      return res.status(400).json({
        ok: false,
        message: 'Resume is required. Please upload a PDF/DOC/DOCX (max 5MB).'
      });
    }

    const existing = await Application.findOne({ jobId, userId: req.user._id });
    if (existing) {
      return res.status(409).json({ ok: false, message: 'You have already applied to this job.' });
    }

    const application = await Application.create({
      jobId,
      userId:    req.user._id,
      resume:    resumePath,
      coverNote: coverNote || ''
    });

    res.status(201).json({
      ok: true,
      message: 'Application submitted.',
      application
    });
  } catch (err) {
    next(err);
  }
};

/* ---------- POST /api/auth/resume   (standalone resume upload) ---------- */
exports.uploadOnly = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No file uploaded.' });
    }
    const resumePath = '/uploads/' + req.file.filename;
    req.user.resume = resumePath;
    await req.user.save();
    res.json({ ok: true, message: 'Resume uploaded.', resume: resumePath });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/applications/user (jobseeker — my applications) ---------- */
exports.userApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'jobId',
        select: 'title company location salary type industry isActive',
        populate: { path: 'employerId', select: 'name company' }
      });

    res.json({ ok: true, applications });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/applications/employer (employer — applicants for my jobs) ---------- */
exports.employerApplications = async (req, res, next) => {
  try {
    const myJobs = await Job.find({ employerId: req.user._id }).select('_id');
    const jobIds = myJobs.map((j) => j._id);

    const filterJob = req.query.jobId;
    const where = { jobId: filterJob && jobIds.some((id) => id.equals(filterJob)) ? filterJob : { $in: jobIds } };

    const applications = await Application.find(where)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone headline location skills resume')
      .populate('jobId',  'title company location salary type');

    res.json({ ok: true, applications });
  } catch (err) {
    next(err);
  }
};

/* ---------- PATCH /api/applications/:id/status (employer — update status) ---------- */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ ok: false, message: 'Invalid status.' });
    }

    const app = await Application.findById(req.params.id).populate('jobId');
    if (!app) {
      return res.status(404).json({ ok: false, message: 'Application not found.' });
    }
    if (app.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ ok: false, message: 'Not your applicant.' });
    }

    app.status = status;
    await app.save();

    res.json({ ok: true, message: 'Status updated.', application: app });
  } catch (err) {
    next(err);
  }
};
