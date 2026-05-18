/* ============================================================
   LCC Job Portal — Express Server Entry
   ============================================================ */
require('dotenv').config();

const path        = require('path');
const fs          = require('fs');
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes            = require('./routes/authRoutes');
const jobRoutes             = require('./routes/jobRoutes');
const applicationRoutes     = require('./routes/applicationRoutes');
const hiringRequestRoutes   = require('./routes/hiringRequestRoutes');
const blogRoutes            = require('./routes/blogRoutes');
const adminRoutes           = require('./routes/adminRoutes');

const app = express();

// ---------- DB ----------
connectDB();

// ---------- CORS ----------
const corsOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, cb) {
    // Allow requests with no origin (curl, mobile, file://)
    if (!origin) return cb(null, true);
    if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true
}));

// ---------- Security & parsing ----------
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // serve uploads to any origin
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---------- Rate limit ----------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Stricter limiter for auth (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { ok: false, message: 'Too many auth attempts. Please try again later.' }
});
app.use('/api/auth/', authLimiter);

// ---------- Static — serve uploaded resumes ----------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'LCC Job Portal API',
    time: new Date().toISOString()
  });
});

app.use('/api/auth',              authRoutes);
app.use('/api/jobs',              jobRoutes);
app.use('/api/hiring-requests',   hiringRequestRoutes);
app.use('/api/blogs',             blogRoutes);
app.use('/api/admin',             adminRoutes);
app.use('/api',                   applicationRoutes); // /api/apply, /api/applications/*

// ---------- Static frontend (unified deploy) ----------
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath, { index: 'index.html', extensions: ['html'] }));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ ok: false, message: 'Endpoint not found: ' + req.originalUrl });
  }
  const rel = req.path.replace(/^\//, '');
  if (rel && !rel.includes('..')) {
    const htmlPath = path.join(frontendPath, rel.endsWith('.html') ? rel : rel + '.html');
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
      return res.sendFile(htmlPath);
    }
  }
  return res.sendFile(path.join(frontendPath, 'index.html'));
});

// ---------- Error handler ----------
app.use(errorHandler);

// ---------- Start ----------
const PORT = parseInt(process.env.PORT, 10) || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('==============================================');
  console.log(`  LCC Job Portal API`);
  console.log(`  Mode:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Port:  ${PORT}`);
  console.log(`  Site:  http://localhost:${PORT}/`);
  console.log(`  API:   http://localhost:${PORT}/api/health`);
  console.log('==============================================');
});
