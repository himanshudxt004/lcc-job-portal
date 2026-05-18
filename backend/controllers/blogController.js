const Blog = require('../models/Blog');
const { BLOG_CATEGORIES } = require('../models/Blog');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base, excludeId) {
  let slug = slugify(base) || 'post';
  let n = 0;
  while (true) {
    const candidate = n ? `${slug}-${n}` : slug;
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await Blog.findOne(q);
    if (!exists) return candidate;
    n += 1;
  }
}

/* ---------- GET /api/blogs (public) ---------- */
exports.list = async (req, res, next) => {
  try {
    const { category, featured, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    const pageNum  = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(parseInt(limit, 10) || 12, 50);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .select('-content')
        .populate('authorId', 'name'),
      Blog.countDocuments(query)
    ]);

    res.json({
      ok: true,
      page: pageNum,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      categories: BLOG_CATEGORIES,
      blogs
    });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/blogs/admin/all (admin) ---------- */
exports.adminList = async (req, res, next) => {
  try {
    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email');
    res.json({ ok: true, blogs });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/blogs/:slug ---------- */
exports.getBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true })
      .populate('authorId', 'name');
    if (!blog) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }
    res.json({ ok: true, blog });
  } catch (err) {
    next(err);
  }
};

/* ---------- GET /api/blogs/admin/:id (admin) ---------- */
exports.adminGetOne = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('authorId', 'name email');
    if (!blog) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }
    res.json({ ok: true, blog });
  } catch (err) {
    next(err);
  }
};

/* ---------- POST /api/blogs (admin) ---------- */
exports.create = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, isPublished, isFeatured, slug } = req.body;

    const blogSlug = slug ? slugify(slug) : await uniqueSlug(title);
    const coverImage = req.file ? '/uploads/blog/' + req.file.filename : '';

    const published = isPublished === true || isPublished === 'true';

    const blog = await Blog.create({
      title,
      slug: blogSlug,
      excerpt: excerpt || '',
      content,
      category: BLOG_CATEGORIES.includes(category) ? category : 'Career Tips',
      coverImage,
      isPublished: published,
      isFeatured: isFeatured === true || isFeatured === 'true',
      publishedAt: published ? new Date() : null,
      authorId: req.user._id
    });

    res.status(201).json({ ok: true, message: 'Blog created.', blog });
  } catch (err) {
    next(err);
  }
};

/* ---------- PUT /api/blogs/:id (admin) ---------- */
exports.update = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }

    const fields = ['title', 'excerpt', 'content', 'category', 'isFeatured'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) blog[f] = req.body[f];
    });

    if (req.body.category && BLOG_CATEGORIES.includes(req.body.category)) {
      blog.category = req.body.category;
    }

    if (req.body.slug) {
      blog.slug = await uniqueSlug(req.body.slug, blog._id);
    } else if (req.body.title && req.body.title !== blog.title) {
      blog.slug = await uniqueSlug(req.body.title, blog._id);
    }

    if (req.file) {
      blog.coverImage = '/uploads/blog/' + req.file.filename;
    }

    if (req.body.isPublished !== undefined) {
      const pub = req.body.isPublished === true || req.body.isPublished === 'true';
      blog.isPublished = pub;
      if (pub && !blog.publishedAt) blog.publishedAt = new Date();
    }

    if (req.body.isFeatured !== undefined) {
      blog.isFeatured = req.body.isFeatured === true || req.body.isFeatured === 'true';
    }

    await blog.save();
    res.json({ ok: true, message: 'Blog updated.', blog });
  } catch (err) {
    next(err);
  }
};

/* ---------- DELETE /api/blogs/:id (admin) ---------- */
exports.remove = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ ok: false, message: 'Blog post not found.' });
    }
    res.json({ ok: true, message: 'Blog deleted.' });
  } catch (err) {
    next(err);
  }
};
