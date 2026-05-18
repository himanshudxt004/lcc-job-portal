const Job           = require('../models/Job');
const Application   = require('../models/Application');
const Blog          = require('../models/Blog');
const HiringRequest = require('../models/HiringRequest');

/* ---------- GET /api/admin/stats ---------- */
exports.stats = async (req, res, next) => {
  try {
    const [jobs, applications, blogs, hiringRequests] = await Promise.all([
      Job.countDocuments({}),
      Application.countDocuments({}),
      Blog.countDocuments({}),
      HiringRequest.countDocuments({})
    ]);

    const [activeJobs, publishedBlogs, newRequests] = await Promise.all([
      Job.countDocuments({ isActive: true }),
      Blog.countDocuments({ isPublished: true }),
      HiringRequest.countDocuments({ status: 'new' })
    ]);

    res.json({
      ok: true,
      stats: {
        jobs,
        activeJobs,
        applications,
        blogs,
        publishedBlogs,
        hiringRequests,
        newHiringRequests: newRequests
      }
    });
  } catch (err) {
    next(err);
  }
};
